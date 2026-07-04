import { Injectable } from '@nestjs/common';
import { DeleteProjectGroupResult, DisableProjectGroupResult, RestartProjectGroupResult } from '@dpd/shared';
import { DeploymentsDeleteRepository } from './deployments-delete.repository';
import { DeploymentsDisableRepository } from './deployments-disable.repository';
import { DeploymentsRestartRepository } from './deployments-restart.repository';
import { ServicesRepository } from './services.repository';

@Injectable()
export class DeploymentsProjectRepository {
  constructor(
    private readonly deleteRepository: DeploymentsDeleteRepository,
    private readonly disableRepository: DeploymentsDisableRepository,
    private readonly restartRepository: DeploymentsRestartRepository,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async deleteByNames(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<DeleteProjectGroupResult> {
    const deleted: DeleteProjectGroupResult['deleted'] = [];

    for (const name of names) {
      const serviceDeleted = await this.servicesRepository.deleteIfExists(namespace, name);
      if (serviceDeleted) {
        deleted.push({ kind: 'Service', name });
      }

      await this.deleteRepository.delete(namespace, name);
      deleted.push({ kind: 'Deployment', name });
      deleted.push({ kind: 'Secret', name: `${name}-env` });
    }

    return { partOf, namespace, deleted };
  }

  async restartByNames(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<RestartProjectGroupResult> {
    const restarted: string[] = [];

    for (const name of names) {
      await this.restartRepository.restart(namespace, name);
      restarted.push(name);
    }

    return { partOf, namespace, restarted };
  }

  async disableByNames(
    namespace: string,
    partOf: string,
    names: string[],
  ): Promise<DisableProjectGroupResult> {
    const disabled: string[] = [];

    for (const name of names) {
      const summary = await this.disableRepository.disable(namespace, name);
      if (summary.disabled) {
        disabled.push(name);
      }
    }

    return { partOf, namespace, disabled };
  }
}
