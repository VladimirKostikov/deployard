import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { K8sContextStore } from './context/k8s-context.store';
import { K8sClientPool } from './pool/k8s-client.pool';

@Injectable()
export class K8sService {
  constructor(
    private readonly clientPool: K8sClientPool,
    private readonly contextStore: K8sContextStore,
  ) {}

  get apps(): k8s.AppsV1Api {
    return this.resolveClients().apps;
  }

  get core(): k8s.CoreV1Api {
    return this.resolveClients().core;
  }

  get auth(): k8s.AuthenticationV1Api {
    return this.resolveClients().auth;
  }

  get networking(): k8s.NetworkingV1Api {
    return this.resolveClients().networking;
  }

  isReady(): boolean {
    return this.clientPool.isReady();
  }

  getKubeConfig(): k8s.KubeConfig {
    return this.resolveClients().kubeConfig;
  }

  getKubeConfigForContext(context: string): k8s.KubeConfig {
    return this.clientPool.resolve(context).kubeConfig;
  }

  runInCluster<T>(cluster: string | undefined, callback: () => T): T {
    return this.contextStore.run(cluster, callback);
  }

  private resolveClients() {
    return this.clientPool.resolve(this.contextStore.getCluster());
  }
}
