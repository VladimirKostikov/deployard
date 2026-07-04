import { ForbiddenException, Injectable } from '@nestjs/common';
import { ApiErrorCode, AuthUser } from '@dpd/shared';
import { K8sClientPool } from './pool/k8s-client.pool';

@Injectable()
export class ClusterAccessService {
  constructor(private readonly clientPool: K8sClientPool) {}

  resolveCluster(_user: AuthUser | undefined, requested?: string) {
    if (!requested) {
      return undefined;
    }

    const defaultContext = this.clientPool.getDefaultContext();
    if (!defaultContext || requested !== defaultContext) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Cluster access denied',
      });
    }

    return requested;
  }

  listAccessibleClusters(_user: AuthUser | undefined) {
    const defaultContext = this.clientPool.getDefaultContext();
    return this.clientPool.listClusters().filter((cluster) => cluster.name === defaultContext);
  }
}
