import { Injectable } from '@nestjs/common';
import { EndpointAddressSummary, EndpointPortSummary, EndpointSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class EndpointMapper {
  toSummary(item: k8s.V1Endpoints): EndpointSummary {
    const addresses: EndpointAddressSummary[] = [];

    for (const subset of item.subsets ?? []) {
      for (const address of subset.addresses ?? []) {
        addresses.push({
          ip: address.ip ?? '',
          podName: address.targetRef?.name,
          nodeName: address.nodeName,
          ready: true,
        });
      }

      for (const address of subset.notReadyAddresses ?? []) {
        addresses.push({
          ip: address.ip ?? '',
          podName: address.targetRef?.name,
          nodeName: address.nodeName,
          ready: false,
        });
      }
    }

    const ports = (item.subsets?.[0]?.ports ?? []).map((port) => this.toPortSummary(port));

    return {
      name: item.metadata?.name ?? '',
      namespace: item.metadata?.namespace ?? '',
      addresses,
      ports,
    };
  }

  private toPortSummary(port: { name?: string; port?: number; protocol?: string }): EndpointPortSummary {
    return {
      name: port.name,
      port: port.port ?? 0,
      protocol: port.protocol ?? 'TCP',
    };
  }
}
