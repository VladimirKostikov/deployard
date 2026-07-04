import { BadRequestException, Injectable, forwardRef, Inject } from '@nestjs/common';
import {
  ApiErrorCode,
  ClusterImageLoadResult,
  ComposeBuildResult,
  ComposeImportPreview,
  ComposeImportRequest,
  ComposeImportResult,
  ComposeProjectDiscoveryResult,
  ComposeUpResult,
  DockerScanResult,
  ImportEnvironmentStatus,
} from '@dpd/shared';
import { ClusterImageLoadService } from '../../compose/cluster-image-load.service';
import { ComposeBuildService, ComposeStreamHandlers } from '../../compose/compose-build.service';
import { ComposeDiscoveryService } from '../../compose/compose-discovery.service';
import { ComposeToK8sMapper } from '../../compose/compose-to-k8s.mapper';
import { DockerScanService } from '../../compose/docker-scan.service';
import { ensureLocalProjectImages, mergeLocalImageOverrides, resolveBuildServices } from './import-local-images';
import { ComposeImportApplyService } from './compose-import-apply.service';
import { ComposeImportSyncService } from './compose-import-sync.service';

export interface ComposeStreamOptions {
  namespace?: string;
  partOf?: string;
  syncToCluster?: boolean;
  clusterContext?: string;
}

@Injectable()
export class ImportService {
  constructor(
    private readonly mapper: ComposeToK8sMapper,
    private readonly discoveryService: ComposeDiscoveryService,
    private readonly composeBuildService: ComposeBuildService,
    private readonly clusterImageLoadService: ClusterImageLoadService,
    private readonly dockerScanService: DockerScanService,
    private readonly composeImportApplyService: ComposeImportApplyService,
    @Inject(forwardRef(() => ComposeImportSyncService))
    private readonly composeImportSyncService: ComposeImportSyncService,
  ) {}

  previewCompose(request: ComposeImportRequest): ComposeImportPreview {
    const plan = this.composeImportApplyService.buildPlan(request);
    return this.mapper.toPreview(plan);
  }

  applyCompose(request: ComposeImportRequest): Promise<ComposeImportResult> {
    return this.composeImportApplyService.applyCompose(request);
  }

  discoverProjects(): ComposeProjectDiscoveryResult {
    return this.discoveryService.discoverProjects();
  }

  getEnvironmentStatus(): ImportEnvironmentStatus {
    const dockerResult = this.dockerScanService.scanProjects();
    const discovery = this.discoveryService.discoverProjects();

    return {
      dockerAvailable: dockerResult.available,
      dockerMessage: dockerResult.message,
      discoveryPaths: this.discoveryService.getDiscoveryPaths(),
      kindClusterName: this.clusterImageLoadService.getClusterName(),
      kindAvailable: this.clusterImageLoadService.isKindAvailable(),
      message: discovery.message,
    };
  }

  buildProject(projectId: string, imageOverrides: Record<string, string> = {}): ComposeBuildResult {
    try {
      return this.composeBuildService.buildProject(projectId, imageOverrides);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose build failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_IMPORT_FAILED,
        message,
      });
    }
  }

  upProject(projectId: string, imageOverrides: Record<string, string> = {}): ComposeUpResult {
    try {
      return this.composeBuildService.upProject(projectId, imageOverrides);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose up failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_IMPORT_FAILED,
        message,
      });
    }
  }

  streamUpProject(
    projectId: string,
    imageOverrides: Record<string, string>,
    handlers: ComposeStreamHandlers,
    options: ComposeStreamOptions = {},
  ) {
    return this.composeBuildService.streamUpProject(projectId, imageOverrides, {
      onLine: handlers.onLine,
      onError: handlers.onError,
      onComplete: (result) => {
        void this.composeImportSyncService.completeStreamUp(
          projectId,
          result,
          handlers,
          imageOverrides,
          options,
        );
      },
    });
  }

  stopProject(projectId: string): Promise<ComposeUpResult> {
    try {
      return Promise.resolve(this.composeBuildService.stopProject(projectId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose stop failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_IMPORT_FAILED,
        message,
      });
    }
  }

  downProject(projectId: string): Promise<ComposeUpResult> {
    try {
      return Promise.resolve(this.composeBuildService.downProject(projectId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose down failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_IMPORT_FAILED,
        message,
      });
    }
  }

  loadImagesToCluster(
    images: string[],
    projectId?: string,
    imageOverrides: Record<string, string> = {},
    projectName?: string,
  ): ClusterImageLoadResult {
    try {
      const requested = [...new Set(images.map((image) => image.trim()).filter(Boolean))];
      const resolvedProjectId =
        projectId?.trim() ||
        (projectName?.trim() ? this.discoveryService.findFileProjectId(projectName.trim()) : undefined);

      if (resolvedProjectId) {
        const prepared = this.composeBuildService.ensureProjectImagesBuilt(
          resolvedProjectId,
          imageOverrides,
          requested,
        );
        const targets = prepared.taggedImages.length > 0 ? prepared.taggedImages : requested;
        const missing = targets.filter((image) => !this.composeBuildService.imageExists(image));

        if (missing.length > 0) {
          throw new Error(`Failed to prepare local images: ${missing.join(', ')}`);
        }

        return this.clusterImageLoadService.loadImages(targets);
      }

      const missing = requested.filter((image) => !this.composeBuildService.imageExists(image));
      if (missing.length > 0) {
        throw new Error(
          `Local images are missing (${missing.join(', ')}). Select a compose project from the list and run import again.`,
        );
      }

      return this.clusterImageLoadService.loadImages(requested);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cluster image load failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_IMPORT_FAILED,
        message,
      });
    }
  }

  scanDockerProjects(): DockerScanResult {
    return this.dockerScanService.scanProjects();
  }

  async previewProject(
    projectId: string,
    namespace: string,
    imageOverrides: Record<string, string> = {},
    exposeHostPorts = false,
  ): Promise<ComposeImportPreview> {
    const loaded = this.discoveryService.loadProjectCompose(projectId);
    return this.previewCompose({
      namespace,
      composeYaml: loaded.composeYaml,
      imageOverrides,
      exposeHostPorts,
      projectName: loaded.projectName,
    });
  }

  applyProject(
    projectId: string,
    namespace: string,
    imageOverrides: Record<string, string> = {},
    exposeHostPorts = false,
    skipImagePrepare = false,
  ): Promise<ComposeImportResult> {
    const loaded = this.discoveryService.loadProjectCompose(projectId);
    const buildServices = resolveBuildServices(loaded.composeYaml, loaded.projectName);
    const mergedOverrides = mergeLocalImageOverrides(
      buildServices,
      imageOverrides,
      loaded.projectName,
    );
    const resolvedOverrides = skipImagePrepare
      ? mergedOverrides
      : ensureLocalProjectImages(
          this.composeBuildService,
          projectId,
          loaded.composeYaml,
          loaded.projectName,
          mergedOverrides,
        );

    return this.applyCompose({
      namespace,
      composeYaml: loaded.composeYaml,
      imageOverrides: resolvedOverrides,
      exposeHostPorts,
      projectName: loaded.projectName,
      skipImagePrepare,
    });
  }

  async previewDockerProject(
    projectName: string,
    namespace: string,
    imageOverrides: Record<string, string> = {},
    exposeHostPorts = false,
  ): Promise<ComposeImportPreview> {
    return this.previewProject(`docker:${projectName}`, namespace, imageOverrides, exposeHostPorts);
  }

  async applyDockerProject(
    projectName: string,
    namespace: string,
    imageOverrides: Record<string, string> = {},
    exposeHostPorts = false,
  ): Promise<ComposeImportResult> {
    return this.applyProject(`docker:${projectName}`, namespace, imageOverrides, exposeHostPorts);
  }
}
