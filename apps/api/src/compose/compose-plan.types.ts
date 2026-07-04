export interface ParsedComposePort {
  containerPort: number;
  hostPort?: number;
}

export interface ParsedComposeHealthcheck {
  test: string[];
  intervalSeconds?: number;
  timeoutSeconds?: number;
  retries?: number;
}

export interface ParsedComposeService {
  name: string;
  image?: string;
  build?: boolean;
  ports: ParsedComposePort[];
  environment: Record<string, string>;
  dependsOn: string[];
  volumes: string[];
  healthcheck?: ParsedComposeHealthcheck;
}

export interface ParsedComposeFile {
  projectName: string;
  services: ParsedComposeService[];
  namedVolumes: string[];
}

export interface ComposeNginxUpstream {
  host: string;
  port: number;
}

export interface ComposeK8sServicePlan {
  name: string;
  resourceName: string;
  image: string;
  containerPort: number;
  hostPort?: number;
  replicas: number;
  dependsOn: string[];
  environment: Record<string, string>;
  volumeMounts: Array<{ name: string; mountPath: string }>;
  pvcNames: string[];
  healthcheck?: ParsedComposeHealthcheck;
  hasBuild: boolean;
  createService: boolean;
  localImage: boolean;
  nginxUpstream?: ComposeNginxUpstream;
  nginxConfigMapName?: string;
}

export interface ComposeK8sPlan {
  projectName: string;
  namespace: string;
  services: ComposeK8sServicePlan[];
  warnings: import('@dpd/shared').ComposeImportWarning[];
}
