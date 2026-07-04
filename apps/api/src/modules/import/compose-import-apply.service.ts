import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ApiErrorCode,
  ComposeImportAppliedResource,
  ComposeImportRequest,
  ComposeImportResult,
  resolveLocalKindNodePort,
} from '@dpd/shared';
import { ClusterImageLoadService } from '../../compose/cluster-image-load.service';
import { ComposeToK8sMapper } from '../../compose/compose-to-k8s.mapper';
import { ComposeK8sServicePlan } from '../../compose/compose-plan.types';
import { buildComposeNginxConfig } from '../../compose/compose-nginx-config';
import { DeploymentsComposeRepository } from '../../k8s/repositories/deployments-compose.repository';
import { PersistentVolumeClaimsRepository } from '../../k8s/repositories/persistent-volume-claims.repository';
import { SecretsRepository } from '../../k8s/repositories/secrets.repository';
import { ServicesComposeRepository } from '../../k8s/repositories/services-compose.repository';
import { ServicesRepository } from '../../k8s/repositories/services.repository';
import { ConfigMapsRepository } from '../../k8s/repositories/configmaps.repository';
import { K8sService } from '../../k8s/k8s.service';
import { collectImportImages } from './import-plan-images';
import { ComposeOrphanPruneService } from '../../compose/compose-orphan-prune.service';
import { prepareComposeServiceSecrets } from './compose-import-secret-prepare';

@Injectable()
export class ComposeImportApplyService {
  constructor(
    private readonly mapper: ComposeToK8sMapper,
    private readonly clusterImageLoadService: ClusterImageLoadService,
    private readonly secretsRepository: SecretsRepository,
    private readonly pvcRepository: PersistentVolumeClaimsRepository,
    private readonly deploymentsComposeRepository: DeploymentsComposeRepository,
    private readonly servicesComposeRepository: ServicesComposeRepository,
    private readonly servicesRepository: ServicesRepository,
    private readonly configMapsRepository: ConfigMapsRepository,
    private readonly k8sService: K8sService,
    private readonly composeOrphanPruneService: ComposeOrphanPruneService,
  ) {}

  buildPlan(request: ComposeImportRequest) {
    try {
      return this.mapper.buildPlan(
        request.composeYaml,
        request.namespace,
        request.imageOverrides ?? {},
        request.exposeHostPorts ?? false,
        request.projectName,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose parse failed';
      throw new BadRequestException({
        code: ApiErrorCode.COMPOSE_PARSE_ERROR,
        message,
      });
    }
  }

  async applyCompose(request: ComposeImportRequest): Promise<ComposeImportResult> {
    const plan = this.buildPlan(request);
    const applied: ComposeImportAppliedResource[] = [];
    const warnings = [...plan.warnings];
    const pvcCreated = new Set<string>();
    const imagesLoaded = request.skipImagePrepare
      ? []
      : await this.loadPlanImages(plan.services, request.imageOverrides ?? {}, warnings);

    for (const pvcName of this.collectPvcNames(plan.services)) {
      if (pvcCreated.has(pvcName)) {
        continue;
      }
      const pvcAction = await this.pvcRepository.create(plan.namespace, pvcName);
      if (pvcAction === 'created') {
        applied.push({ kind: 'PersistentVolumeClaim', name: pvcName, action: 'created' });
      }
      pvcCreated.add(pvcName);
    }

    const resolverIp = await this.resolveClusterDnsIp();
    const secrets = await prepareComposeServiceSecrets(
      plan.namespace,
      plan.projectName,
      plan.services,
      this.secretsRepository,
      this.k8sService,
    );
    for (const secret of secrets) {
      applied.push({ kind: 'Secret', name: secret.name, action: secret.action });
    }

    for (const service of plan.services) {
      await this.applyServiceConfigMaps(
        plan.namespace,
        service,
        applied,
        resolverIp,
      );
    }

    for (const service of plan.services) {
      await this.applyServiceWorkloads(
        plan.namespace,
        plan.projectName,
        service,
        applied,
        request.exposeHostPorts ?? false,
      );
    }

    await this.composeOrphanPruneService.prune(
      plan.namespace,
      plan.projectName,
      plan.services,
      () => undefined,
    );

    return {
      projectName: plan.projectName,
      namespace: plan.namespace,
      created: applied,
      warnings,
      imagesLoaded,
    };
  }

  private collectPvcNames(services: ComposeK8sServicePlan[]): string[] {
    return [...new Set(services.flatMap((service) => service.pvcNames))];
  }

  private async loadPlanImages(
    services: ComposeK8sServicePlan[],
    imageOverrides: Record<string, string>,
    warnings: ComposeImportResult['warnings'],
  ): Promise<string[]> {
    const images = collectImportImages(services, imageOverrides);
    if (images.length === 0 || !this.clusterImageLoadService.isKindAvailable()) {
      return [];
    }

    try {
      const result = this.clusterImageLoadService.loadImages(images);
      for (const failed of result.failed) {
        warnings.push({
          code: 'IMAGE_LOAD_FAILED',
          message: `Failed to load ${failed.image}: ${failed.error}`,
        });
      }

      if (result.failed.length > 0) {
        const failedNames = result.failed.map((entry) => entry.image).join(', ');
        throw new BadRequestException(
          `Failed to load images into kind: ${failedNames}. Build images locally or check Docker access.`,
        );
      }

      return result.loaded;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Cluster image load failed';
      throw new BadRequestException(message);
    }
  }

  private async applyServiceConfigMaps(
    namespace: string,
    service: ComposeK8sServicePlan,
    applied: ComposeImportAppliedResource[],
    resolverIp: string,
  ): Promise<void> {
    if (!service.nginxUpstream || !service.nginxConfigMapName) {
      return;
    }

    const configMapAction = await this.configMapsRepository.upsert(namespace, service.nginxConfigMapName, {
      'default.conf': buildComposeNginxConfig(service.nginxUpstream, resolverIp, namespace),
    });
    applied.push({ kind: 'ConfigMap', name: service.nginxConfigMapName, action: configMapAction });
  }

  private async applyServiceWorkloads(
    namespace: string,
    projectName: string,
    service: ComposeK8sServicePlan,
    applied: ComposeImportAppliedResource[],
    exposeHostPorts: boolean,
  ): Promise<void> {
    const resourceName = service.resourceName;

    const deployment = await this.deploymentsComposeRepository.upsertFromPlan(
      namespace,
      service,
      projectName,
    );
    applied.push({ kind: 'Deployment', name: resourceName, action: deployment.action });

    if (!service.createService) {
      await this.removeLegacyComposeAlias(namespace, projectName, service);
      return;
    }

    const nodePort = exposeHostPorts
      ? resolveLocalKindNodePort(service.containerPort, service.hostPort)
      : undefined;
    const svc = await this.servicesComposeRepository.upsertForDeployment(
      namespace,
      resourceName,
      resourceName,
      service.containerPort,
      service.containerPort,
      nodePort,
      false,
    );
    applied.push({ kind: 'Service', name: resourceName, action: svc.action });

    await this.removeLegacyComposeAlias(namespace, projectName, service);
  }

  private async removeLegacyComposeAlias(
    namespace: string,
    projectName: string,
    service: ComposeK8sServicePlan,
  ): Promise<void> {
    const legacyName = service.name;
    if (legacyName === service.resourceName) {
      return;
    }

    try {
      const deployment = await this.k8sService.apps.readNamespacedDeployment({
        name: legacyName,
        namespace,
      });
      const partOf = deployment.metadata?.labels?.['app.kubernetes.io/part-of']?.trim();
      if (partOf !== projectName.trim()) {
        return;
      }

      await this.servicesRepository.deleteIfExists(namespace, legacyName);
      await this.k8sService.apps.deleteNamespacedDeployment({ name: legacyName, namespace });
      await this.secretsRepository.deleteIfExists(namespace, `${legacyName}-env`);
      await this.secretsRepository.deleteIfExists(namespace, `${legacyName}-secret`);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return;
      }

      throw error;
    }
  }

  private isNotFoundError(error: unknown): boolean {
    const shape = error as { code?: number; statusCode?: number };
    return shape.code === 404 || shape.statusCode === 404;
  }

  private async resolveClusterDnsIp(): Promise<string> {
    try {
      const kubeDns = await this.k8sService.core.readNamespacedService({
        name: 'kube-dns',
        namespace: 'kube-system',
      });
      const clusterIp = kubeDns.spec?.clusterIP?.trim();
      if (clusterIp) {
        return clusterIp;
      }
    } catch {
      return '10.96.0.10';
    }

    return '10.96.0.10';
  }
}
