import { Injectable } from '@nestjs/common';
import { NamespaceSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { INamespacesRepository } from '../interfaces/namespaces.repository.interface';
import { NamespaceMapper } from '../mappers/namespace.mapper';

@Injectable()
export class NamespacesRepository implements INamespacesRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly namespaceMapper: NamespaceMapper,
  ) {}

  async list(): Promise<NamespaceSummary[]> {
    const response = await this.k8sService.core.listNamespace();
    return (response.items ?? []).map((item) => this.namespaceMapper.toSummary(item));
  }

  async create(name: string): Promise<NamespaceSummary> {
    const response = await this.k8sService.core.createNamespace({
      body: {
        metadata: { name },
      },
    });
    return this.namespaceMapper.toSummary(response);
  }

  async delete(name: string): Promise<void> {
    await this.k8sService.core.deleteNamespace({ name });
  }
}
