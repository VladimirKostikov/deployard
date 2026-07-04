import { Injectable } from '@nestjs/common';
import { resolveAvailableNodePort } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { listAllServices } from '../utils/list-all-services';

@Injectable()
export class NodePortAllocatorService {
  private readonly reserved = new Set<number>();

  constructor(private readonly k8sService: K8sService) {}

  async allocate(
    namespace: string,
    serviceName: string,
    preferred: number,
  ): Promise<number> {
    const usedPorts = await this.listUsedNodePorts(namespace, serviceName);

    for (const port of this.reserved) {
      usedPorts.add(port);
    }

    const picked = resolveAvailableNodePort(preferred, usedPorts);
    this.reserved.add(picked);
    return picked;
  }

  release(port: number): void {
    this.reserved.delete(port);
  }

  private async listUsedNodePorts(
    namespace: string,
    serviceName: string,
  ): Promise<Set<number>> {
    const services = await listAllServices(this.k8sService.core);
    const used = new Set<number>();

    for (const service of services) {
      const name = service.metadata?.name;
      const svcNamespace = service.metadata?.namespace;
      if (!name || !svcNamespace) {
        continue;
      }

      const isSameService = svcNamespace === namespace && name === serviceName;

      for (const port of service.spec?.ports ?? []) {
        if (!port.nodePort || isSameService) {
          continue;
        }

        used.add(port.nodePort);
      }
    }

    return used;
  }
}
