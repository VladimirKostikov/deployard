import { Injectable } from '@nestjs/common';
import {
  ALL_NAMESPACES,
  DeploymentRevision,
  DeploymentSummary,
  ContainerEnvVar,
  DeleteProjectGroupResult,
  DisableProjectGroupResult,
  RestartProjectGroupResult,
} from '@dpd/shared';
import { IDeploymentsRepository } from '../interfaces/deployments.repository.interface';
import { DeploymentsCreateRepository } from './deployments-create.repository';
import { DeploymentsDeleteRepository } from './deployments-delete.repository';
import { DeploymentsImageRepository } from './deployments-image.repository';
import { DeploymentsRestartRepository } from './deployments-restart.repository';
import { DeploymentsReadRepository } from './deployments-read.repository';
import { DeploymentsRollbackRepository } from './deployments-rollback.repository';
import { DeploymentsScaleRepository } from './deployments-scale.repository';
import { DeploymentsDisableRepository } from './deployments-disable.repository';
import { DeploymentsProjectRepository } from './deployments-project.repository';

@Injectable()
export class DeploymentsRepository implements IDeploymentsRepository {
  constructor(
    private readonly readRepository: DeploymentsReadRepository,
    private readonly rollbackRepository: DeploymentsRollbackRepository,
    private readonly scaleRepository: DeploymentsScaleRepository,
    private readonly disableRepository: DeploymentsDisableRepository,
    private readonly createRepository: DeploymentsCreateRepository,
    private readonly deleteRepository: DeploymentsDeleteRepository,
    private readonly imageRepository: DeploymentsImageRepository,
    private readonly restartRepository: DeploymentsRestartRepository,
    private readonly projectRepository: DeploymentsProjectRepository,
  ) {}

  list(namespace: string): Promise<DeploymentSummary[]> {
    if (namespace === ALL_NAMESPACES) {
      return this.readRepository.listAll();
    }
    return this.readRepository.list(namespace);
  }

  findByName(namespace: string, name: string): Promise<DeploymentSummary> {
    return this.readRepository.findByName(namespace, name);
  }

  listRevisions(namespace: string, name: string): Promise<DeploymentRevision[]> {
    return this.readRepository.listRevisions(namespace, name);
  }

  rollback(namespace: string, name: string, revision: number): Promise<DeploymentSummary> {
    return this.rollbackRepository.rollback(namespace, name, revision);
  }

  scale(namespace: string, name: string, replicas: number): Promise<DeploymentSummary> {
    return this.scaleRepository.scale(namespace, name, replicas);
  }

  disable(namespace: string, name: string): Promise<DeploymentSummary> {
    return this.disableRepository.disable(namespace, name);
  }

  enable(namespace: string, name: string): Promise<DeploymentSummary> {
    return this.disableRepository.enable(namespace, name);
  }

  create(
    namespace: string,
    name: string,
    image: string,
    replicas: number,
    containerPort?: number,
    env?: ContainerEnvVar[],
    partOf?: string,
  ): Promise<DeploymentSummary> {
    return this.createRepository.create(namespace, name, image, replicas, containerPort, env, partOf);
  }

  delete(namespace: string, name: string): Promise<void> {
    return this.deleteRepository.delete(namespace, name);
  }

  deleteProjectGroup(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<DeleteProjectGroupResult> {
    return this.projectRepository.deleteByNames(namespace, partOf, names);
  }

  restartProjectGroup(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<RestartProjectGroupResult> {
    return this.projectRepository.restartByNames(namespace, partOf, names);
  }

  disableProjectGroup(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<DisableProjectGroupResult> {
    return this.projectRepository.disableByNames(namespace, partOf, names);
  }

  updateImage(namespace: string, name: string, image: string): Promise<DeploymentSummary> {
    return this.imageRepository.updateImage(namespace, name, image);
  }

  restart(namespace: string, name: string): Promise<DeploymentSummary> {
    return this.restartRepository.restart(namespace, name);
  }
}
