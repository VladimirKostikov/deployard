import { Injectable } from '@nestjs/common';
import { EndpointSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { EndpointMapper } from '../mappers/endpoint.mapper';

@Injectable()
export class EndpointsRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly endpointMapper: EndpointMapper,
  ) {}

  async list(namespace: string): Promise<EndpointSummary[]> {
    const response = await this.k8sService.core.listNamespacedEndpoints({ namespace });
    return (response.items ?? []).map((item) => this.endpointMapper.toSummary(item));
  }
}
