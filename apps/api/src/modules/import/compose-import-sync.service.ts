import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ComposeGroupSyncResult,
  ComposeManifestReconcileResult,
  ComposeUpResult,
} from '@dpd/shared';
import { ComposeGroupSyncService } from '../../compose/compose-group-sync.service';
import { resolveImagesToLoad } from '../../compose/compose-group-sync.helpers';
import { ComposeOrphanPruneService } from '../../compose/compose-orphan-prune.service';
import { ComposeStreamHandlers } from '../../compose/compose-build.service';
import { ComposeDiscoveryService } from '../../compose/compose-discovery.service';
import { K8sContextStore } from '../../k8s/context/k8s-context.store';
import { ServicesRepository } from '../../k8s/repositories/services.repository';
import { K8sService } from '../../k8s/k8s.service';
import { mergeLocalImageOverrides, resolveBuildServices } from './import-local-images';
import { ComposeImportApplyService } from './compose-import-apply.service';
import { ComposeStreamOptions, ImportService } from './import.service';

@Injectable()
export class ComposeImportSyncService {
  constructor(
    private readonly discoveryService: ComposeDiscoveryService,
    private readonly composeGroupSyncService: ComposeGroupSyncService,
    private readonly composeOrphanPruneService: ComposeOrphanPruneService,
    private readonly composeImportApplyService: ComposeImportApplyService,
    private readonly k8sContextStore: K8sContextStore,
    private readonly servicesRepository: ServicesRepository,
    private readonly k8sService: K8sService,
    @Inject(forwardRef(() => ImportService))
    private readonly importService: ImportService,
  ) {}

  async completeStreamUp(
    projectId: string,
    result: ComposeUpResult,
    handlers: ComposeStreamHandlers,
    imageOverrides: Record<string, string>,
    options: ComposeStreamOptions,
  ) {
    try {
      const shouldSync =
        options.syncToCluster !== false &&
        Boolean(options.namespace?.trim()) &&
        Boolean(options.partOf?.trim());

      if (!shouldSync) {
        handlers.onComplete(result);
        return;
      }

      const clusterContext = options.clusterContext?.trim() || undefined;
      const mergedOverrides = this.resolveStreamImageOverrides(projectId, imageOverrides);
      const partOf = options.partOf!.trim();
      const namespace = options.namespace!.trim();
      const loaded = this.discoveryService.loadProjectCompose(projectId);
      const buildServiceNames = resolveBuildServices(loaded.composeYaml, loaded.projectName);
      const imagesToLoad = resolveImagesToLoad(
        result.builtImages,
        result.taggedImages,
        buildServiceNames,
      );

      let preloadedImages: string[] = [];
      let preloadFailed: ComposeGroupSyncResult['imagesFailed'] = [];

      if (imagesToLoad.length > 0) {
        handlers.onLine('', 'stdout');
        handlers.onLine('Cluster sync: loading images into kind...', 'stdout');

        const loadResult = await this.k8sContextStore.run(clusterContext, () =>
          this.importService.loadImagesToCluster(imagesToLoad, projectId, mergedOverrides, partOf),
        );

        preloadedImages = loadResult.loaded;
        preloadFailed = loadResult.failed;

        for (const image of preloadedImages) {
          handlers.onLine(`Loaded into kind: ${image}`, 'stdout');
        }

        for (const entry of preloadFailed) {
          handlers.onLine(`Failed to load ${entry.image}: ${entry.error}`, 'stdout');
        }
      }

      const manifest = await this.k8sContextStore.run(clusterContext, () =>
        this.reconcileComposeManifest(projectId, namespace, partOf, mergedOverrides, (line) =>
          handlers.onLine(line, 'stdout'),
        ),
      );

      const clusterSync = await this.k8sContextStore.run(clusterContext, () =>
        this.composeGroupSyncService.syncGroup(
          namespace,
          partOf,
          result.builtImages,
          result.taggedImages,
          mergedOverrides,
          (line) => handlers.onLine(line, 'stdout'),
          {
            buildServiceNames,
            ...(imagesToLoad.length > 0 ? { preloadedImages } : {}),
            loadImages: (images) =>
              this.importService.loadImagesToCluster(images, projectId, mergedOverrides, partOf),
          },
        ),
      );

      handlers.onComplete({
        ...result,
        clusterSync: {
          ...clusterSync,
          imagesFailed: [...preloadFailed, ...clusterSync.imagesFailed],
          manifest,
        },
      });
    } catch (error) {
      handlers.onError(error instanceof Error ? error : new Error('Cluster sync failed'));
    }
  }

  private resolveStreamImageOverrides(
    projectId: string,
    imageOverrides: Record<string, string>,
  ): Record<string, string> {
    if (Object.keys(imageOverrides).length > 0) {
      return imageOverrides;
    }

    const loaded = this.discoveryService.loadProjectCompose(projectId);
    const buildServices = resolveBuildServices(loaded.composeYaml, loaded.projectName);
    return mergeLocalImageOverrides(buildServices, {}, loaded.projectName);
  }

  private async reconcileComposeManifest(
    projectId: string,
    namespace: string,
    partOf: string,
    imageOverrides: Record<string, string>,
    onLine: (line: string) => void,
  ): Promise<ComposeManifestReconcileResult> {
    onLine('');
    onLine('Cluster sync: applying compose manifest from disk...');

    const loaded = this.discoveryService.loadProjectCompose(projectId);
    const exposeHostPorts = await this.resolveGroupExposeHostPorts(namespace, partOf);
    const applyResult = await this.importService.applyProject(
      projectId,
      namespace,
      imageOverrides,
      exposeHostPorts,
      true,
    );

    const plan = this.composeImportApplyService.buildPlan({
      namespace,
      composeYaml: loaded.composeYaml,
      imageOverrides,
      exposeHostPorts,
      projectName: loaded.projectName,
      skipImagePrepare: true,
    });

    for (const entry of applyResult.created) {
      onLine(`${entry.action === 'created' ? 'Created' : 'Updated'} ${entry.kind} ${entry.name}`);
    }

    const resourcesRemoved = await this.composeOrphanPruneService.prune(
      namespace,
      partOf,
      plan.services,
      onLine,
    );

    return {
      resourcesCreated: applyResult.created.filter((entry) => entry.action === 'created').length,
      resourcesUpdated: applyResult.created.filter((entry) => entry.action === 'updated').length,
      resourcesRemoved,
    };
  }

  private async resolveGroupExposeHostPorts(namespace: string, partOf: string): Promise<boolean> {
    const response = await this.k8sService.apps.listNamespacedDeployment({
      namespace,
      labelSelector: `app.kubernetes.io/part-of=${partOf.trim()}`,
    });

    for (const item of response.items ?? []) {
      const name = item.metadata?.name?.trim();
      if (!name) {
        continue;
      }

      const services = await this.servicesRepository.listForDeployment(namespace, name);
      const hasNodePort = services.some((service) =>
        service.ports.some((port) => typeof port.nodePort === 'number' && port.nodePort > 0),
      );

      if (hasNodePort) {
        return true;
      }
    }

    return false;
  }
}
