import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { AuthUser } from '@dpd/shared';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ClusterAccessService } from '../cluster-access.service';
import { K8sContextStore } from '../context/k8s-context.store';

@Injectable()
export class ClusterContextInterceptor implements NestInterceptor {
  constructor(
    private readonly contextStore: K8sContextStore,
    private readonly clusterAccess: ClusterAccessService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const headerCluster = request.headers['x-k8s-cluster'];
    const requested =
      (request.query.cluster as string | undefined) ??
      (Array.isArray(headerCluster) ? headerCluster[0] : headerCluster);

    const cluster = this.clusterAccess.resolveCluster(request.user, requested);

    return this.contextStore.run(cluster, () => next.handle());
  }
}
