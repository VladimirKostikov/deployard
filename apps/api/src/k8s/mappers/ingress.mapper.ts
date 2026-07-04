import { Injectable } from '@nestjs/common';
import { IngressSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class IngressMapper {
  toSummary(item: k8s.V1Ingress): IngressSummary {
    const name = item.metadata?.name ?? '';
    const namespace = item.metadata?.namespace ?? '';
    const hosts: string[] = [];
    const paths: string[] = [];
    let serviceName = '';
    let servicePort = 0;

    for (const rule of item.spec?.rules ?? []) {
      if (rule.host) {
        hosts.push(rule.host);
      }

      for (const pathRule of rule.http?.paths ?? []) {
        if (pathRule.path) {
          paths.push(pathRule.path);
        }

        if (!serviceName && pathRule.backend?.service?.name) {
          serviceName = pathRule.backend.service.name;
          servicePort = pathRule.backend.service.port?.number ?? 0;
        }
      }
    }

    return {
      name,
      namespace,
      hosts,
      paths,
      serviceName,
      servicePort,
      createdAt: item.metadata?.creationTimestamp?.toISOString() ?? '',
    };
  }
}
