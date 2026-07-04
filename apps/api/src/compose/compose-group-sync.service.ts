import { Inject, Injectable } from '@nestjs/common';
import { ClusterImageLoadResult, ComposeGroupSyncResult } from '@dpd/shared';
import { ClusterImageLoadService } from './cluster-image-load.service';
import { isBuildDeployment, resolveImagesToLoad } from './compose-group-sync.helpers';
import { resolveServiceImage } from './compose-service-image';
import {
  DEPLOYMENTS_REPOSITORY,
  IDeploymentsRepository,
} from '../k8s/interfaces/deployments.repository.interface';

export interface ComposeGroupSyncOptions {
  buildServiceNames?: string[];
  preloadedImages?: string[];
  loadImages?: (images: string[]) => ClusterImageLoadResult | Promise<ClusterImageLoadResult>;
  isKindAvailable?: () => boolean | Promise<boolean>;
}

@Injectable()
export class ComposeGroupSyncService {
  constructor(
    @Inject(DEPLOYMENTS_REPOSITORY)
    private readonly deploymentsRepository: IDeploymentsRepository,
    private readonly clusterImageLoadService: ClusterImageLoadService,
  ) {}

  async syncGroup(
    namespace: string,
    partOf: string,
    builtImages: string[],
    taggedImages: string[],
    imageOverrides: Record<string, string>,
    onLine: (line: string) => void,
    options: ComposeGroupSyncOptions = {},
  ): Promise<ComposeGroupSyncResult> {
    const normalizedPartOf = partOf.trim();
    const buildServiceNames = options.buildServiceNames ?? [];
    const imagesToLoad = resolveImagesToLoad(builtImages, taggedImages, buildServiceNames);

    onLine('');
    onLine('Cluster sync: loading images into kind...');

    let imagesLoaded: string[] = [];
    let imagesFailed: Array<{ image: string; error: string }> = [];

    const kindAvailable = options.isKindAvailable
      ? await options.isKindAvailable()
      : this.clusterImageLoadService.isKindAvailable();

    if (options.preloadedImages !== undefined) {
      imagesLoaded = options.preloadedImages;
      onLine(`Cluster sync: ${imagesLoaded.length} image(s) already loaded into kind`);
    } else if (imagesToLoad.length === 0) {
      onLine('Cluster sync: no built images to load');
    } else if (!kindAvailable) {
      onLine('Cluster sync: kind cluster is unavailable, skipping image load');
    } else {
      const loadResult = options.loadImages
        ? await options.loadImages(imagesToLoad)
        : this.clusterImageLoadService.loadImages(imagesToLoad);
      imagesLoaded = loadResult.loaded;
      imagesFailed = loadResult.failed;

      for (const image of imagesLoaded) {
        onLine(`Loaded into kind: ${image}`);
      }

      for (const entry of imagesFailed) {
        onLine(`Failed to load ${entry.image}: ${entry.error}`);
      }
    }

    onLine('');
    onLine(`Cluster sync: updating deployments in ${namespace} (group ${normalizedPartOf})...`);

    const deployments = await this.deploymentsRepository.list(namespace);
    const groupDeployments = deployments.filter(
      (deployment) => deployment.partOf?.trim() === normalizedPartOf,
    );

    const deploymentsUpdated: Array<{ name: string; image: string }> = [];
    const deploymentsSkipped: string[] = [];
    const loadedImageSet = new Set(imagesLoaded);

    for (const deployment of groupDeployments) {
      if (!isBuildDeployment(deployment.name, normalizedPartOf, buildServiceNames)) {
        deploymentsSkipped.push(deployment.name);
        onLine(`Skipped ${deployment.name}: image is managed outside compose build`);
        continue;
      }

      const targetImage = resolveServiceImage(
        deployment.name,
        builtImages,
        taggedImages,
        imageOverrides,
        { projectName: normalizedPartOf },
      );

      if (!targetImage) {
        deploymentsSkipped.push(deployment.name);
        onLine(`Skipped ${deployment.name}: no matching built image`);
        continue;
      }

      if (deployment.image === targetImage) {
        if (loadedImageSet.has(targetImage)) {
          onLine(`Image unchanged for ${deployment.name}: ${targetImage}`);
        } else {
          deploymentsSkipped.push(deployment.name);
          onLine(`Skipped ${deployment.name}: image already ${targetImage}`);
        }
        continue;
      }

      await this.deploymentsRepository.updateImage(namespace, deployment.name, targetImage);
      deploymentsUpdated.push({ name: deployment.name, image: targetImage });
      onLine(`Updated ${deployment.name} -> ${targetImage}`);
    }

    onLine('');
    onLine(`Cluster sync: restarting deployments in ${namespace} (group ${normalizedPartOf})...`);

    const deploymentsRestarted: string[] = [];

    for (const deployment of groupDeployments) {
      if (deployment.disabled) {
        onLine(`Skipped restart for ${deployment.name}: deployment is disabled`);
        continue;
      }

      await this.deploymentsRepository.restart(namespace, deployment.name);
      deploymentsRestarted.push(deployment.name);
      onLine(`Restarted ${deployment.name}`);
    }

    if (groupDeployments.length === 0) {
      onLine(`No Kubernetes deployments found for group "${normalizedPartOf}"`);
    }

    onLine(
      `Cluster sync done: ${imagesLoaded.length} loaded, ${deploymentsUpdated.length} updated, ${deploymentsRestarted.length} restarted`,
    );

    return {
      imagesLoaded,
      imagesFailed,
      deploymentsUpdated,
      deploymentsRestarted,
      deploymentsSkipped,
    };
  }
}
