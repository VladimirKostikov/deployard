import { Inject, Injectable } from '@nestjs/common';
import { IngressSummary } from '@dpd/shared';
import {
  INGRESS_REPOSITORY,
  IIngressRepository,
} from '../../k8s/interfaces/ingress.repository.interface';
import { CreateIngressDto } from './dto/create-ingress.dto';

@Injectable()
export class IngressService {
  constructor(
    @Inject(INGRESS_REPOSITORY)
    private readonly ingressRepository: IIngressRepository,
  ) {}

  list(namespace: string): Promise<IngressSummary[]> {
    return this.ingressRepository.list(namespace);
  }

  create(dto: CreateIngressDto): Promise<IngressSummary> {
    return this.ingressRepository.create(
      dto.namespace,
      dto.name,
      dto.host,
      dto.path,
      dto.serviceName,
      dto.servicePort,
    );
  }

  delete(namespace: string, name: string): Promise<void> {
    return this.ingressRepository.delete(namespace, name);
  }
}
