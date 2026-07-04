import { Injectable } from '@nestjs/common';
import { ServicePortSummary, ServiceSummary, ServiceType } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class ServiceMapper {
  toSummary(item: k8s.V1Service): ServiceSummary {
    return {
      name: item.metadata?.name ?? '',
      namespace: item.metadata?.namespace ?? '',
      type: (item.spec?.type as ServiceType) ?? 'ClusterIP',
      clusterIp: item.spec?.clusterIP ?? '',
      ports: (item.spec?.ports ?? []).map((port) => this.toPortSummary(port)),
      selector: item.spec?.selector ?? {},
      createdAt: item.metadata?.creationTimestamp?.toISOString() ?? '',
    };
  }

  private toPortSummary(port: k8s.V1ServicePort): ServicePortSummary {
    const targetPort =
      typeof port.targetPort === 'number' ? port.targetPort : Number(port.targetPort ?? port.port ?? 0);

    return {
      name: port.name,
      port: port.port ?? 0,
      targetPort,
      nodePort: port.nodePort,
      protocol: port.protocol ?? 'TCP',
    };
  }
}
