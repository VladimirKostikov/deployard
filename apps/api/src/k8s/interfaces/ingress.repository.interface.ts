import { IngressSummary } from '@dpd/shared';

export interface IIngressRepository {
  list(namespace: string): Promise<IngressSummary[]>;
  create(
    namespace: string,
    name: string,
    host: string,
    path: string,
    serviceName: string,
    servicePort: number,
  ): Promise<IngressSummary>;
  delete(namespace: string, name: string): Promise<void>;
}

export const INGRESS_REPOSITORY = Symbol('INGRESS_REPOSITORY');
