import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiErrorCode, NamespaceSummary } from '@dpd/shared';
import {
  INamespacesRepository,
  NAMESPACES_REPOSITORY,
} from '../../k8s/interfaces/namespaces.repository.interface';
import { KubeExceptionMapper } from '../../k8s/mappers/kube-exception.mapper';

const PROTECTED_PREFIX = 'kube-';

@Injectable()
export class NamespacesService {
  constructor(
    @Inject(NAMESPACES_REPOSITORY)
    private readonly namespacesRepository: INamespacesRepository,
    private readonly kubeExceptionMapper: KubeExceptionMapper,
  ) {}

  list(): Promise<NamespaceSummary[]> {
    return this.namespacesRepository.list();
  }

  async create(name: string): Promise<NamespaceSummary> {
    try {
      return await this.namespacesRepository.create(name);
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 409) {
        throw new ConflictException({
          code: ApiErrorCode.NAMESPACE_ALREADY_EXISTS,
          message: `Namespace ${name} already exists`,
        });
      }

      throw this.kubeExceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.NAMESPACE_NOT_FOUND,
        resourceLabel: 'Namespace',
        resourceName: name,
      });
    }
  }

  async delete(name: string): Promise<void> {
    if (name.startsWith(PROTECTED_PREFIX)) {
      throw new BadRequestException({
        code: ApiErrorCode.NAMESPACE_PROTECTED,
        message: `Namespace ${name} is protected and cannot be deleted`,
      });
    }

    try {
      await this.namespacesRepository.delete(name);
    } catch (error) {
      throw this.kubeExceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.NAMESPACE_NOT_FOUND,
        resourceLabel: 'Namespace',
        resourceName: name,
      });
    }
  }
}
