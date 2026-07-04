import { execFileSync } from 'node:child_process';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DockerScanProject, DockerScanResult } from '@dpd/shared';

interface DockerContainerInspect {
  Name: string;
  Config: {
    Image: string;
    Env?: string[];
    Labels?: Record<string, string>;
  };
  HostConfig?: {
    PortBindings?: Record<string, Array<{ HostPort?: string }>>;
  };
}

@Injectable()
export class DockerScanService {
  constructor(private readonly configService: ConfigService) {}

  scanProjects(): DockerScanResult {
    if (!this.isEnabled()) {
      return {
        available: false,
        message: 'Docker scan is disabled. Set DOCKER_SCAN_ENABLED=true and mount /var/run/docker.sock',
        projects: [],
      };
    }

    try {
      this.runDocker(['info']);
    } catch {
      return {
        available: false,
        message: 'Docker daemon is not reachable from the API container',
        projects: [],
      };
    }

    const containers = this.listComposeContainers();
    const projects = this.groupProjects(containers);

    return {
      available: true,
      projects,
    };
  }

  exportProjectCompose(projectName: string): string {
    const containers = this.listComposeContainers().filter(
      (entry) => entry.project === projectName,
    );

    if (containers.length === 0) {
      throw new Error(`No compose containers found for project "${projectName}"`);
    }

    const lines = ['services:'];

    for (const container of containers) {
      lines.push(`  ${container.service}:`);
      lines.push(`    image: ${container.image}`);
      if (container.ports.length > 0) {
        lines.push('    ports:');
        for (const port of container.ports) {
          lines.push(`      - "${port}"`);
        }
      }
      if (container.env.length > 0) {
        lines.push('    environment:');
        for (const envEntry of container.env) {
          lines.push(`      ${envEntry.key}: ${JSON.stringify(envEntry.value)}`);
        }
      }
      if (container.dependsOn.length > 0) {
        lines.push('    depends_on:');
        for (const dependency of container.dependsOn) {
          lines.push(`      - ${dependency}`);
        }
      }
    }

    return `${lines.join('\n')}\n`;
  }

  resolveProjectBuildContext(projectName: string): { composePath: string; workdir: string } {
    const containers = this.listComposeContainers().filter(
      (entry) => entry.project === projectName,
    );

    if (containers.length === 0) {
      throw new Error(`No compose containers found for project "${projectName}"`);
    }

    const labels = this.readProjectLabels(containers[0].containerId);
    const configFiles = labels['com.docker.compose.project.config_files'] ?? '';
    const workingDir = labels['com.docker.compose.project.working_dir'] ?? '';
    const composePath = configFiles.split(',')[0]?.trim();

    if (!composePath || !workingDir) {
      throw new Error(
        `Compose paths are missing for project "${projectName}". Rebuild demo projects from the file list instead.`,
      );
    }

    return { composePath, workdir: workingDir };
  }

  private readProjectLabels(containerId: string): Record<string, string> {
    const output = this.runDocker(['inspect', containerId]);
    const inspect = JSON.parse(output)[0] as DockerContainerInspect;
    return inspect.Config.Labels ?? {};
  }

  private isEnabled(): boolean {
    return this.configService.get<string>('DOCKER_SCAN_ENABLED', 'false') === 'true';
  }

  private listComposeContainers(): Array<{
    containerId: string;
    project: string;
    service: string;
    image: string;
    ports: string[];
    env: Array<{ key: string; value: string }>;
    dependsOn: string[];
    running: boolean;
  }> {
    const output = this.runDocker([
      'ps',
      '-a',
      '--filter',
      'label=com.docker.compose.project',
      '--format',
      '{{json .}}',
    ]);

    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as { ID: string; State: string; Names: string })
      .map((entry) => ({
        containerId: entry.ID,
        ...this.inspectContainer(entry.ID, entry.State === 'running'),
      }));
  }

  private inspectContainer(
    containerId: string,
    running: boolean,
  ): {
    project: string;
    service: string;
    image: string;
    ports: string[];
    env: Array<{ key: string; value: string }>;
    dependsOn: string[];
    running: boolean;
  } {
    const output = this.runDocker(['inspect', containerId]);
    const inspect = JSON.parse(output)[0] as DockerContainerInspect;
    const labels = inspect.Config.Labels ?? {};
    const project = labels['com.docker.compose.project'] ?? 'unknown';
    const service = labels['com.docker.compose.service'] ?? inspect.Name.replace(/^\//, '');
    const dependsOn = (labels['com.docker.compose.depends_on'] ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const ports = Object.entries(inspect.HostConfig?.PortBindings ?? {}).flatMap(
      ([containerPort, bindings]) =>
        (bindings ?? []).map((binding) => {
          const hostPort = binding.HostPort ?? '';
          const normalizedPort = containerPort.replace('/tcp', '');
          return hostPort ? `${hostPort}:${normalizedPort}` : normalizedPort;
        }),
    );

    const env = (inspect.Config.Env ?? [])
      .map((entry) => {
        const separatorIndex = entry.indexOf('=');
        if (separatorIndex <= 0) {
          return null;
        }
        return {
          key: entry.slice(0, separatorIndex),
          value: entry.slice(separatorIndex + 1),
        };
      })
      .filter((entry): entry is { key: string; value: string } => entry !== null)
      .filter((entry) => !entry.key.startsWith('PATH='));

    return {
      project,
      service,
      image: inspect.Config.Image,
      ports,
      env,
      dependsOn,
      running,
    };
  }

  private groupProjects(
    containers: Array<{
      project: string;
      service: string;
      running: boolean;
    }>,
  ): DockerScanProject[] {
    const grouped = new Map<string, { serviceCount: number; runningCount: number }>();

    for (const container of containers) {
      const current = grouped.get(container.project) ?? { serviceCount: 0, runningCount: 0 };
      current.serviceCount += 1;
      if (container.running) {
        current.runningCount += 1;
      }
      grouped.set(container.project, current);
    }

    return [...grouped.entries()]
      .map(([name, stats]) => ({
        name,
        serviceCount: stats.serviceCount,
        runningCount: stats.runningCount,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private runDocker(args: string[]): string {
    return execFileSync('docker', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  }
}
