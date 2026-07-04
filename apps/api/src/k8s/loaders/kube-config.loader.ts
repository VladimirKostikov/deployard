import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as k8s from '@kubernetes/client-node';
import { withInsecureTls } from '../kube-cluster-tls';

@Injectable()
export class KubeConfigLoader {
  constructor(private readonly configService: ConfigService) {}

  load(): k8s.KubeConfig {
    const kubeConfig = new k8s.KubeConfig();
    const mode = this.configService.get<string>('K8S_CONFIG_MODE', 'default');

    if (mode === 'cluster') {
      kubeConfig.loadFromCluster();
    } else {
      kubeConfig.loadFromDefault();
    }

    kubeConfig.clusters = this.applyTlsCompat(kubeConfig.clusters);
    return kubeConfig;
  }

  private applyTlsCompat(clusters: k8s.Cluster[]): k8s.Cluster[] {
    const skipTlsSetting = this.configService.get<string>('K8S_SKIP_TLS_VERIFY', 'auto');

    return clusters.map((cluster) => {
      const server = cluster.server ?? '';
      const usesHttp = server.startsWith('http://');
      const localDockerEndpoint = this.isLocalDockerEndpoint(server);
      const shouldSkip =
        skipTlsSetting === 'true' ||
        (skipTlsSetting === 'auto' && (usesHttp || localDockerEndpoint));

      if (!shouldSkip) {
        return cluster;
      }

      return withInsecureTls(cluster);
    });
  }

  private isLocalDockerEndpoint(server: string): boolean {
    try {
      const hostname = new URL(server).hostname;
      return ['127.0.0.1', 'localhost', 'host.docker.internal'].includes(hostname);
    } catch {
      return false;
    }
  }
}
