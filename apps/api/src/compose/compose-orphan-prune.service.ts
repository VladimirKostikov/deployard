import { Injectable } from '@nestjs/common';
import { ComposeK8sServicePlan } from './compose-plan.types';
import { ConfigMapsRepository } from '../k8s/repositories/configmaps.repository';
import { DeploymentsProjectRepository } from '../k8s/repositories/deployments-project.repository';
import { K8sService } from '../k8s/k8s.service';
import { KubeExceptionMapper } from '../k8s/mappers/kube-exception.mapper';

@Injectable()
export class ComposeOrphanPruneService {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
    private readonly deploymentsProjectRepository: DeploymentsProjectRepository,
    private readonly configMapsRepository: ConfigMapsRepository,
  ) {}

  async prune(
    namespace: string,
    partOf: string,
    services: ComposeK8sServicePlan[],
    onLine: (line: string) => void,
  ): Promise<string[]> {
    const expected = new Set(services.map((service) => service.resourceName));
    const existing = await this.listGroupDeploymentNames(namespace, partOf);
    const orphans = existing.filter((name) => !expected.has(name));

    if (orphans.length === 0) {
      return [];
    }

    onLine('');
    onLine(`Cluster sync: removing ${orphans.length} deployment(s) no longer in compose...`);

    for (const name of orphans) {
      const configMapName = `${name}-nginx`;
      await this.configMapsRepository.deleteIfExists(namespace, configMapName);
      onLine(`Removed ConfigMap ${configMapName}`);
    }

    await this.deploymentsProjectRepository.deleteByNames(namespace, partOf, orphans);

    for (const name of orphans) {
      onLine(`Removed ${name}`);
    }

    return orphans;
  }

  private async listGroupDeploymentNames(namespace: string, partOf: string): Promise<string[]> {
    try {
      const response = await this.k8sService.apps.listNamespacedDeployment({
        namespace,
        labelSelector: `app.kubernetes.io/part-of=${partOf.trim()}`,
      });

      return (response.items ?? [])
        .map((item) => item.metadata?.name?.trim())
        .filter((name): name is string => Boolean(name));
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 404) {
        return [];
      }

      throw error;
    }
  }
}
