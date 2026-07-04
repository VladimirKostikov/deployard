import {
  DeploymentRevision,
  DeploymentSummary,
  ContainerEnvVar,
  DeleteProjectGroupResult,
  DisableProjectGroupResult,
  RestartProjectGroupResult,
} from '@dpd/shared';

export interface IDeploymentsRepository {
  list(namespace: string): Promise<DeploymentSummary[]>;
  findByName(namespace: string, name: string): Promise<DeploymentSummary>;
  listRevisions(namespace: string, name: string): Promise<DeploymentRevision[]>;
  rollback(namespace: string, name: string, revision: number): Promise<DeploymentSummary>;
  scale(namespace: string, name: string, replicas: number): Promise<DeploymentSummary>;
  disable(namespace: string, name: string): Promise<DeploymentSummary>;
  enable(namespace: string, name: string): Promise<DeploymentSummary>;
  create(
    namespace: string,
    name: string,
    image: string,
    replicas: number,
    containerPort?: number,
    env?: ContainerEnvVar[],
    partOf?: string,
  ): Promise<DeploymentSummary>;
  delete(namespace: string, name: string): Promise<void>;
  deleteProjectGroup(namespace: string, partOf: string, names: string[]): Promise<DeleteProjectGroupResult>;
  restartProjectGroup(namespace: string, partOf: string, names: string[]): Promise<RestartProjectGroupResult>;
  disableProjectGroup(namespace: string, partOf: string, names: string[]): Promise<DisableProjectGroupResult>;
  updateImage(namespace: string, name: string, image: string): Promise<DeploymentSummary>;
  restart(namespace: string, name: string): Promise<DeploymentSummary>;
}

export const DEPLOYMENTS_REPOSITORY = Symbol('DEPLOYMENTS_REPOSITORY');
