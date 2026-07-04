import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiErrorCode, ComposeProjectDiscoveryResult, ComposeProjectSummary } from '@dpd/shared';
import { discoverComposeFiles, readComposeFile } from './compose-file-discovery';
import { isPathUnderRoots } from './compose-project-path';
import { ComposeParserService } from './compose-parser.service';
import { DockerScanService } from './docker-scan.service';

@Injectable()
export class ComposeDiscoveryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly parser: ComposeParserService,
    private readonly dockerScanService: DockerScanService,
  ) {}

  getDiscoveryPaths(): string[] {
    return this.resolveDiscoveryPaths();
  }

  discoverProjects(): ComposeProjectDiscoveryResult {
    const dockerResult = this.dockerScanService.scanProjects();
    const fileProjects = this.discoverFileProjects();
    const dockerProjects = dockerResult.available
      ? dockerResult.projects.map((entry) => this.toDockerSummary(entry.name, entry.serviceCount, entry.runningCount))
      : [];

    const projects = [...fileProjects, ...dockerProjects].sort((left, right) => {
      if (left.source !== right.source) {
        return left.source === 'file' ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });

    if (!projects.length) {
      return {
        available: dockerResult.available,
        message: dockerResult.available
          ? 'No compose projects found. Add demos under /workspace/demo or run docker compose up.'
          : dockerResult.message,
        projects: [],
      };
    }

    return {
      available: true,
      projects,
    };
  }

  loadProjectCompose(projectId: string): { composeYaml: string; projectName: string } {
    this.assertKnownProjectId(projectId);

    if (projectId.startsWith('docker:')) {
      const projectName = projectId.slice('docker:'.length);
      const composeYaml = this.dockerScanService.exportProjectCompose(projectName);
      const parsed = this.parser.parse(composeYaml, projectName);
      return { composeYaml, projectName: parsed.projectName };
    }

    if (projectId.startsWith('file:')) {
      const composePath = projectId.slice('file:'.length);
      this.assertComposePathAllowed(composePath);
      const composeYaml = readComposeFile(composePath);
      const parsed = this.parser.parse(composeYaml);
      return { composeYaml, projectName: parsed.projectName };
    }

    throw new Error(`Unknown project id "${projectId}"`);
  }

  private assertKnownProjectId(projectId: string) {
    if (!this.getAllowedProjectIds().has(projectId)) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Compose project is not available for import',
      });
    }
  }

  private assertComposePathAllowed(composePath: string) {
    const roots = this.resolveDiscoveryPaths();

    if (!roots.length || !isPathUnderRoots(composePath, roots)) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Compose file path is outside allowed discovery roots',
      });
    }
  }

  private getAllowedProjectIds(): Set<string> {
    const allowed = new Set<string>();
    const dockerResult = this.dockerScanService.scanProjects();

    for (const entry of discoverComposeFiles(this.resolveDiscoveryPaths())) {
      allowed.add(`file:${entry.path}`);
    }

    if (dockerResult.available) {
      for (const entry of dockerResult.projects) {
        allowed.add(`docker:${entry.name}`);
      }
    }

    return allowed;
  }

  findFileProjectId(projectName: string): string | undefined {
    const normalized = projectName.trim();
    if (!normalized) {
      return undefined;
    }

    const match = discoverComposeFiles(this.resolveDiscoveryPaths()).find(
      (entry) => entry.name === normalized,
    );

    return match ? `file:${match.path}` : undefined;
  }

  private discoverFileProjects(): ComposeProjectSummary[] {
    const paths = this.resolveDiscoveryPaths();
    if (paths.length === 0) {
      return [];
    }

    return discoverComposeFiles(paths).map((entry) => {
      const composeYaml = readComposeFile(entry.path);
      const parsed = this.parser.parse(composeYaml, entry.name);

      return {
        id: `file:${entry.path}`,
        name: entry.name,
        source: 'file' as const,
        composeFile: entry.path,
        serviceCount: parsed.services.length,
        runningCount: 0,
        buildServices: parsed.services.filter((service) => service.build).map((service) => service.name),
      };
    });
  }

  private resolveDiscoveryPaths(): string[] {
    const raw = this.configService.get<string>('COMPOSE_DISCOVERY_PATHS', '/workspace/demo');
    return raw
      .split(':')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private toDockerSummary(
    name: string,
    serviceCount: number,
    runningCount: number,
  ): ComposeProjectSummary {
    return {
      id: `docker:${name}`,
      name,
      source: 'docker',
      serviceCount,
      runningCount,
      buildServices: [],
    };
  }
}
