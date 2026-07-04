import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClusterSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sClientFactory } from '../factories/k8s-client.factory';
import { KubeConfigLoader } from '../loaders/kube-config.loader';

interface ClusterClients {
  apps: k8s.AppsV1Api;
  core: k8s.CoreV1Api;
  auth: k8s.AuthenticationV1Api;
  networking: k8s.NetworkingV1Api;
  kubeConfig: k8s.KubeConfig;
}

@Injectable()
export class K8sClientPool implements OnModuleInit {
  private readonly logger = new Logger(K8sClientPool.name);
  private readonly clients = new Map<string, ClusterClients>();
  private defaultContext = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly kubeConfigLoader: KubeConfigLoader,
    private readonly clientFactory: K8sClientFactory,
  ) {}

  onModuleInit() {
    const kubeConfig = this.kubeConfigLoader.load();
    const configuredContext = this.configService.get<string>('K8S_CONTEXT');
    const allowed = this.parseAllowedContexts();

    this.defaultContext = configuredContext ?? kubeConfig.getCurrentContext() ?? '';

    for (const context of kubeConfig.contexts) {
      if (allowed && !allowed.includes(context.name)) {
        continue;
      }

      const scopedConfig = this.cloneConfigForContext(kubeConfig, context.name);
      const created = this.clientFactory.create(scopedConfig);
      this.clients.set(context.name, {
        apps: created.apps,
        core: created.core,
        auth: created.auth,
        networking: created.networking,
        kubeConfig: scopedConfig,
      });
    }

    if (!this.clients.has(this.defaultContext) && this.clients.size > 0) {
      this.defaultContext = [...this.clients.keys()][0];
    }

    this.logger.log(
      `Kubernetes pool ready (${this.clients.size} context(s), default: ${this.defaultContext || 'none'})`,
    );
  }

  resolve(context?: string): ClusterClients {
    const key = context ?? this.defaultContext;

    if (!key) {
      throw new BadRequestException({ code: 'CLUSTER_NOT_CONFIGURED', message: 'No Kubernetes context' });
    }

    const clients = this.clients.get(key);
    if (!clients) {
      throw new BadRequestException({ code: 'CLUSTER_NOT_FOUND', message: `Unknown cluster: ${key}` });
    }

    return clients;
  }

  listClusters(): ClusterSummary[] {
    const kubeConfig = this.kubeConfigLoader.load();

    return [...this.clients.keys()].map((name) => {
      const context = kubeConfig.contexts.find((item) => item.name === name);
      const cluster = kubeConfig.clusters.find((item) => item.name === context?.cluster);

      return {
        name,
        server: cluster?.server ?? '',
        current: name === this.defaultContext,
      };
    });
  }

  getDefaultContext(): string {
    return this.defaultContext;
  }

  isReady(): boolean {
    return this.clients.size > 0;
  }

  private parseAllowedContexts(): string[] | null {
    const raw = this.configService.get<string>('K8S_ALLOWED_CONTEXTS');
    if (!raw) {
      return null;
    }

    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private cloneConfigForContext(kubeConfig: k8s.KubeConfig, contextName: string): k8s.KubeConfig {
    const scoped = new k8s.KubeConfig();
    scoped.loadFromOptions({
      clusters: kubeConfig.clusters,
      users: kubeConfig.users,
      contexts: kubeConfig.contexts,
      currentContext: contextName,
    });
    return scoped;
  }
}
