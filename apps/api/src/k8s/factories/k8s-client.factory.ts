import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';

export interface K8sApiClients {
  apps: k8s.AppsV1Api;
  core: k8s.CoreV1Api;
  auth: k8s.AuthenticationV1Api;
  networking: k8s.NetworkingV1Api;
  kubeConfig: k8s.KubeConfig;
}

@Injectable()
export class K8sClientFactory {
  create(kubeConfig: k8s.KubeConfig): K8sApiClients {
    return {
      apps: kubeConfig.makeApiClient(k8s.AppsV1Api),
      core: kubeConfig.makeApiClient(k8s.CoreV1Api),
      auth: kubeConfig.makeApiClient(k8s.AuthenticationV1Api),
      networking: kubeConfig.makeApiClient(k8s.NetworkingV1Api),
      kubeConfig,
    };
  }
}
