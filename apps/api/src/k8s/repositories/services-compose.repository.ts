import { Injectable } from '@nestjs/common';
import { ApiErrorCode, ServiceSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { NodePortAllocatorService } from '../network/node-port-allocator.service';
import { K8sService } from '../k8s.service';
import { ServiceMapper } from '../mappers/service.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { isNodePortConflict } from '../utils/is-node-port-conflict';

const NODE_PORT_RETRY_LIMIT = 8;

@Injectable()
export class ServicesComposeRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly serviceMapper: ServiceMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
    private readonly nodePortAllocator: NodePortAllocatorService,
  ) {}

  async upsertForDeployment(
    namespace: string,
    name: string,
    deploymentName: string,
    port: number,
    targetPort: number,
    nodePort?: number,
    publishNodePort = false,
  ): Promise<{ summary: ServiceSummary; action: 'created' | 'updated' }> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({
      name: deploymentName,
      namespace,
    });
    const selector = deployment.spec?.selector?.matchLabels;

    if (!selector || Object.keys(selector).length === 0) {
      throw this.exceptionMapper.toHttpException(new Error('Deployment has no selector labels'), {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: deploymentName,
      });
    }

    const useNodePort = Boolean(nodePort) || publishNodePort;

    if (!useNodePort) {
      return this.upsertClusterIpService(namespace, name, selector, port, targetPort);
    }

    const preferred = nodePort ?? 30000;
    let allocated = await this.nodePortAllocator.allocate(namespace, name, preferred);

    for (let attempt = 0; attempt < NODE_PORT_RETRY_LIMIT; attempt++) {
      try {
        return await this.upsertNodePortService(
          namespace,
          name,
          selector,
          port,
          targetPort,
          allocated,
        );
      } catch (error) {
        if (!isNodePortConflict(error) || attempt === NODE_PORT_RETRY_LIMIT - 1) {
          this.nodePortAllocator.release(allocated);
          throw this.exceptionMapper.toHttpException(error, {
            notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
            resourceLabel: 'Service',
            resourceName: name,
          });
        }

        this.nodePortAllocator.release(allocated);
        allocated = await this.nodePortAllocator.allocate(namespace, name, allocated + 1);
      }
    }

    throw this.exceptionMapper.toHttpException(new Error('Failed to allocate NodePort'), {
      notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
      resourceLabel: 'Service',
      resourceName: name,
    });
  }

  private async upsertClusterIpService(
    namespace: string,
    name: string,
    selector: Record<string, string>,
    port: number,
    targetPort: number,
  ): Promise<{ summary: ServiceSummary; action: 'created' | 'updated' }> {
    const body = this.buildServiceBody(namespace, name, selector, port, targetPort, false);

    try {
      const created = await this.k8sService.core.createNamespacedService({ namespace, body });
      return { summary: this.serviceMapper.toSummary(created), action: 'created' };
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) !== 409) {
        throw error;
      }
    }

    const updated = await this.k8sService.core.replaceNamespacedService({
      name,
      namespace,
      body,
    });
    return { summary: this.serviceMapper.toSummary(updated), action: 'updated' };
  }

  private async upsertNodePortService(
    namespace: string,
    name: string,
    selector: Record<string, string>,
    port: number,
    targetPort: number,
    allocatedNodePort: number,
  ): Promise<{ summary: ServiceSummary; action: 'created' | 'updated' }> {
    const createBody = this.buildServiceBody(
      namespace,
      name,
      selector,
      port,
      targetPort,
      true,
      allocatedNodePort,
    );

    try {
      const created = await this.k8sService.core.createNamespacedService({
        namespace,
        body: createBody,
      });
      return { summary: this.serviceMapper.toSummary(created), action: 'created' };
    } catch (error) {
      if (isNodePortConflict(error)) {
        throw error;
      }

      if (this.exceptionMapper.resolveStatusCode(error) !== 409) {
        throw error;
      }
    }

    const existing = await this.k8sService.core.readNamespacedService({ name, namespace });
    const existingPort = existing.spec?.ports?.find((entry) => entry.port === port);
    const updateNodePort = existingPort?.nodePort ?? allocatedNodePort;

    const updated = await this.k8sService.core.replaceNamespacedService({
      name,
      namespace,
      body: this.buildServiceBody(
        namespace,
        name,
        selector,
        port,
        targetPort,
        true,
        updateNodePort,
      ),
    });
    return { summary: this.serviceMapper.toSummary(updated), action: 'updated' };
  }

  private buildServiceBody(
    namespace: string,
    name: string,
    selector: Record<string, string>,
    port: number,
    targetPort: number,
    useNodePort: boolean,
    nodePort?: number,
  ): k8s.V1Service {
    return {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        type: useNodePort ? 'NodePort' : 'ClusterIP',
        selector,
        ports: [
          {
            name: 'http',
            port,
            targetPort,
            protocol: 'TCP',
            ...(useNodePort && nodePort ? { nodePort } : {}),
          },
        ],
      },
    };
  }
}
