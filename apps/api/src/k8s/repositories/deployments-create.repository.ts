import { Injectable } from '@nestjs/common';
import { ApiErrorCode, ContainerEnvVar, DeploymentSummary } from '@dpd/shared';
import { HttpException } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { mergeEnvVars } from '../config/deployment-config.resolver';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { buildProbes, resolveContainerSetup } from '../probes/deployment-probes';
import { resolveContainerRuntimeDefaults } from '../probes/deployment-container.defaults';

@Injectable()
export class DeploymentsCreateRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async create(
    namespace: string,
    name: string,
    image: string,
    replicas: number,
    containerPort?: number,
    env?: ContainerEnvVar[],
    partOf?: string,
  ): Promise<DeploymentSummary> {
    const setup = resolveContainerSetup(image, containerPort);
    const runtimeDefaults = resolveContainerRuntimeDefaults(image);
    const mergedEnv = mergeEnvVars(runtimeDefaults.env, env ?? []);
    const probes = buildProbes(setup.probeKind, setup.probePort, {
      readinessInitialDelaySeconds: runtimeDefaults.readinessInitialDelaySeconds,
      livenessInitialDelaySeconds: runtimeDefaults.livenessInitialDelaySeconds,
    });

    const labels: Record<string, string> = { 'app.kubernetes.io/name': name };
    if (partOf?.trim()) {
      labels['app.kubernetes.io/part-of'] = partOf.trim();
    }

    const body: k8s.V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name,
        namespace,
        labels,
      },
      spec: {
        replicas,
        selector: { matchLabels: { 'app.kubernetes.io/name': name } },
        template: {
          metadata: { labels },
          spec: {
            containers: [
              {
                name,
                image,
                ports: [{ containerPort: setup.containerPort }],
                env: mergedEnv.length > 0 ? mergedEnv : undefined,
                ...probes,
              },
            ],
          },
        },
      },
    };

    try {
      const created = await this.k8sService.apps.createNamespacedDeployment({
        namespace,
        body,
      });
      return this.deploymentMapper.toSummary(created);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }
}
