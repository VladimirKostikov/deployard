import { NamespaceSummary } from '@dpd/shared';

export interface INamespacesRepository {
  list(): Promise<NamespaceSummary[]>;
  create(name: string): Promise<NamespaceSummary>;
  delete(name: string): Promise<void>;
}

export const NAMESPACES_REPOSITORY = Symbol('NAMESPACES_REPOSITORY');
