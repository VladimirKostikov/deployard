import { Injectable } from '@nestjs/common';
import { PodSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class PodMapper {
  toSummary(item: k8s.V1Pod): PodSummary {
    const containerStatuses = item.status?.containerStatuses ?? [];
    const ready = containerStatuses.length > 0 && containerStatuses.every((status) => status.ready);

    return {
      name: item.metadata?.name ?? '',
      namespace: item.metadata?.namespace ?? '',
      phase: (item.status?.phase as PodSummary['phase']) ?? 'Unknown',
      ready,
      restarts: containerStatuses.reduce((sum, status) => sum + (status.restartCount ?? 0), 0),
      nodeName: item.spec?.nodeName,
      podIp: item.status?.podIP,
      hostIp: item.status?.hostIP,
      ports: this.collectContainerPorts(item),
      startedAt: item.status?.startTime?.toISOString(),
      containers: containerStatuses.map((status) => ({
        name: status.name,
        ready: status.ready ?? false,
        restartCount: status.restartCount ?? 0,
        state: this.resolveContainerState(status.state),
        image: status.image ?? '',
        waitingMessage: status.state?.waiting?.message,
      })),
    };
  }

  private resolveContainerState(state?: k8s.V1ContainerState): string {
    if (!state) {
      return 'unknown';
    }
    if (state.running) {
      return 'running';
    }
    if (state.waiting) {
      return state.waiting.reason ?? 'waiting';
    }
    if (state.terminated) {
      return state.terminated.reason ?? 'terminated';
    }
    return 'unknown';
  }

  private collectContainerPorts(item: k8s.V1Pod): number[] {
    const ports = new Set<number>();

    for (const container of item.spec?.containers ?? []) {
      for (const port of container.ports ?? []) {
        if (port.containerPort) {
          ports.add(port.containerPort);
        }
      }
    }

    return [...ports].sort((left, right) => left - right);
  }
}
