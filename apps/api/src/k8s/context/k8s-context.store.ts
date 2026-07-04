import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface K8sContextState {
  cluster?: string;
}

@Injectable()
export class K8sContextStore {
  private readonly storage = new AsyncLocalStorage<K8sContextState>();

  run<T>(cluster: string | undefined, callback: () => T): T {
    return this.storage.run({ cluster }, callback);
  }

  getCluster(): string | undefined {
    return this.storage.getStore()?.cluster;
  }
}
