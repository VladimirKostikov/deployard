import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ComposeBuildResult, ComposeUpResult } from '@dpd/shared';
import { ComposeDiscoveryService } from './compose-discovery.service';
import { mapHostPathToContainer } from './compose-path.mapper';
import { findServiceBuiltImage, listProjectImages } from './compose-project-images';
import { resolveComposeImageOverrides } from './compose-image-overrides';
import { DockerScanService } from './docker-scan.service';
import { runDockerStream, type DockerStreamKind } from './compose-docker.runner';

export interface ComposeStreamHandlers {
  onLine: (line: string, stream: DockerStreamKind) => void;
  onComplete: (result: ComposeUpResult) => void;
  onError: (error: Error) => void;
}

export interface ComposeStreamHandle {
  cancel: () => void;
}

@Injectable()
export class ComposeBuildService {
  constructor(
    private readonly configService: ConfigService,
    private readonly discoveryService: ComposeDiscoveryService,
    private readonly dockerScanService: DockerScanService,
  ) {}

  buildProject(projectId: string, imageOverrides: Record<string, string> = {}): ComposeBuildResult {
    this.ensureDocker();
    const { composePath, workdir, projectName } = this.resolveProject(projectId);
    const mergedOverrides = resolveComposeImageOverrides(composePath, projectName, imageOverrides);
    this.runDocker(['compose', '-f', composePath, 'build'], workdir);
    const builtImages = listProjectImages(
      (args, cwd) => this.runDocker(args, cwd),
      composePath,
      workdir,
      projectName,
    );
    const taggedImages = this.applyImageTags(builtImages, mergedOverrides, projectName);
    return { builtImages, taggedImages };
  }

  ensureProjectImagesBuilt(
    projectId: string,
    imageOverrides: Record<string, string> = {},
    requiredImages: string[] = [],
  ): ComposeBuildResult {
    this.ensureDocker();
    const { composePath, projectName } = this.resolveProject(projectId);
    const mergedOverrides = resolveComposeImageOverrides(composePath, projectName, imageOverrides);
    const targetImages = [
      ...new Set([
        ...Object.values(mergedOverrides).map((image) => image.trim()).filter(Boolean),
        ...requiredImages.map((image) => image.trim()).filter(Boolean),
      ]),
    ];

    if (targetImages.length === 0) {
      return { builtImages: [], taggedImages: [] };
    }

    const missing = targetImages.filter((image) => !this.imageExists(image));
    if (missing.length === 0) {
      return { builtImages: targetImages, taggedImages: targetImages };
    }

    return this.buildProject(projectId, imageOverrides);
  }

  upProject(projectId: string, imageOverrides: Record<string, string> = {}): ComposeUpResult {
    const build = this.buildProject(projectId, imageOverrides);
    this.stopLocalComposeStack(projectId);
    return { ...build, started: false };
  }

  streamUpProject(
    projectId: string,
    imageOverrides: Record<string, string>,
    handlers: ComposeStreamHandlers,
  ): ComposeStreamHandle {
    this.ensureDocker();
    const { composePath, workdir, projectName } = this.resolveProject(projectId);
    const mergedOverrides = resolveComposeImageOverrides(composePath, projectName, imageOverrides);

    handlers.onLine(`$ docker compose -f ${composePath} build`, 'stdout');

    const handle = runDockerStream(
      ['compose', '-f', composePath, 'build'],
      workdir,
      handlers.onLine,
    );

    handle.promise
      .then(() => {
        handlers.onLine('Stopping local Docker Compose containers...', 'stdout');
        this.runComposeDown(composePath, workdir);

        const builtImages = listProjectImages(
          (args, cwd) => this.runDocker(args, cwd),
          composePath,
          workdir,
          projectName,
        );
        const taggedImages = this.applyImageTags(builtImages, mergedOverrides, projectName);
        handlers.onComplete({ builtImages, taggedImages, started: false });
      })
      .catch((error) => {
        handlers.onError(error instanceof Error ? error : new Error('Compose up failed'));
      });

    return { cancel: () => handle.kill() };
  }

  stopProject(projectId: string): ComposeUpResult {
    this.ensureDocker();
    const { composePath, workdir } = this.resolveProject(projectId);
    this.runDocker(['compose', '-f', composePath, 'stop'], workdir);
    return { builtImages: [], taggedImages: [], started: false };
  }

  downProject(projectId: string): ComposeUpResult {
    this.ensureDocker();
    const { composePath, workdir } = this.resolveProject(projectId);
    this.runDocker(['compose', '-f', composePath, 'down'], workdir);
    return { builtImages: [], taggedImages: [], started: false };
  }

  private stopLocalComposeStack(projectId: string): void {
    const { composePath, workdir } = this.resolveProject(projectId);
    this.runComposeDown(composePath, workdir);
  }

  private runComposeDown(composePath: string, workdir: string): void {
    try {
      this.runDocker(['compose', '-f', composePath, 'down', '--remove-orphans'], workdir);
    } catch {
      return;
    }
  }

  private resolveProject(projectId: string) {
    if (projectId.startsWith('file:')) {
      const composePath = projectId.slice('file:'.length);
      const { projectName } = this.discoveryService.loadProjectCompose(projectId);
      return { composePath, workdir: join(composePath, '..'), projectName };
    }

    if (projectId.startsWith('docker:')) {
      const projectName = projectId.slice('docker:'.length);
      const context = this.dockerScanService.resolveProjectBuildContext(projectName);
      const mappedComposePath = this.mapToContainerPath(context.composePath);
      const mappedWorkdir = this.mapToContainerPath(context.workdir);

      if (!mappedComposePath || !mappedWorkdir) {
        throw new Error(
          'Cannot map compose paths into the API container. Select a compose file project or set COMPOSE_HOST_ROOT.',
        );
      }

      return { composePath: mappedComposePath, workdir: mappedWorkdir, projectName };
    }

    throw new Error(`Unknown project id "${projectId}"`);
  }

  private mapToContainerPath(hostPath: string): string | null {
    const mapped = mapHostPathToContainer(
      hostPath,
      this.configService.get<string>('COMPOSE_HOST_ROOT'),
      this.configService.get<string>('COMPOSE_CONTAINER_ROOT', '/workspace/dpd'),
    );

    return mapped ?? (hostPath.startsWith('/workspace/') ? hostPath : null);
  }

  private ensureDocker(): void {
    if (this.configService.get<string>('DOCKER_SCAN_ENABLED', 'false') !== 'true') {
      throw new Error('Docker is disabled. Set DOCKER_SCAN_ENABLED=true and mount /var/run/docker.sock');
    }

    try {
      this.runDocker(['info']);
    } catch {
      throw new Error('Docker daemon is not reachable from the API container');
    }
  }

  private applyImageTags(
    builtImages: string[],
    imageOverrides: Record<string, string>,
    projectName: string,
  ): string[] {
    const tagged: string[] = [];

    for (const [service, targetImage] of Object.entries(imageOverrides)) {
      const trimmedTarget = targetImage.trim();
      if (!trimmedTarget) {
        continue;
      }

      const source = findServiceBuiltImage(service, builtImages, projectName);

      if (source) {
        if (source !== trimmedTarget) {
          this.runDocker(['tag', source, trimmedTarget]);
        }
        tagged.push(trimmedTarget);
        continue;
      }

      try {
        this.runDocker(['image', 'inspect', trimmedTarget]);
        tagged.push(trimmedTarget);
      } catch {
        throw new Error(
          `No built image found for service "${service}". Expected tag "${trimmedTarget}".`,
        );
      }
    }

    return tagged;
  }

  imageExists(image: string): boolean {
    try {
      this.runDocker(['image', 'inspect', image]);
      return true;
    } catch {
      return false;
    }
  }

  private runDocker(args: string[], cwd?: string): string {
    return execFileSync('docker', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  }
}
