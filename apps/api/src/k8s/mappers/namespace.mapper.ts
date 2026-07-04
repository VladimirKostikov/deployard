import { Injectable } from '@nestjs/common';
import { NamespaceSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class NamespaceMapper {
  toSummary(item: k8s.V1Namespace): NamespaceSummary {
    return {
      name: item.metadata?.name ?? '',
      status: item.status?.phase ?? 'Unknown',
      createdAt: item.metadata?.creationTimestamp?.toISOString() ?? '',
    };
  }
}
