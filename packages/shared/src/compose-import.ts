export type ComposeImportWarningCode =
  | 'BUILD_REQUIRES_IMAGE'
  | 'BIND_MOUNT_SKIPPED'
  | 'ENV_FILE_SKIPPED'
  | 'NETWORKS_SKIPPED'
  | 'DEPENDS_ON_ORDER'
  | 'HOST_PORT_NODEPORT'
  | 'DEFAULT_IMAGE_TAG'
  | 'IMAGE_LOAD_FAILED';

export interface ComposeImportWarning {
  code: ComposeImportWarningCode;
  service?: string;
  message: string;
}

export interface ComposeImportServicePreview {
  name: string;
  image: string;
  containerPort: number;
  hostPort?: number;
  replicas: number;
  dependsOn: string[];
  envKeys: string[];
  volumeNames: string[];
  hasBuild: boolean;
  createService: boolean;
  createSecret: boolean;
  createPvc: boolean;
}

export interface ComposeImportPreview {
  projectName: string;
  namespace: string;
  services: ComposeImportServicePreview[];
  warnings: ComposeImportWarning[];
}

export interface ComposeImportRequest {
  namespace: string;
  composeYaml: string;
  imageOverrides?: Record<string, string>;
  exposeHostPorts?: boolean;
  projectName?: string;
  skipImagePrepare?: boolean;
}

export type ComposeImportResourceAction = 'created' | 'updated';

export interface ComposeImportAppliedResource {
  kind: 'Deployment' | 'Service' | 'Secret' | 'PersistentVolumeClaim' | 'ConfigMap';
  name: string;
  action: ComposeImportResourceAction;
}

export interface ComposeImportBrowserAccess {
  serviceName: string;
  servicePort: number;
  url: string;
  localPort: number;
}

export interface ComposeImportResult {
  projectName: string;
  namespace: string;
  created: ComposeImportAppliedResource[];
  warnings: ComposeImportWarning[];
  imagesLoaded?: string[];
  browserAccess?: ComposeImportBrowserAccess[];
}

export interface DockerScanProject {
  name: string;
  serviceCount: number;
  runningCount: number;
  composeFile?: string;
}

export type ComposeProjectSource = 'file' | 'docker';

export interface ComposeProjectSummary {
  id: string;
  name: string;
  source: ComposeProjectSource;
  composeFile?: string;
  hasGit?: boolean;
  serviceCount: number;
  runningCount: number;
  buildServices: string[];
}

export interface ComposeProjectDiscoveryResult {
  available: boolean;
  message?: string;
  projects: ComposeProjectSummary[];
}

export interface DockerScanResult {
  available: boolean;
  message?: string;
  projects: DockerScanProject[];
}

export interface ProjectImportRequest {
  namespace: string;
  projectId: string;
  imageOverrides?: Record<string, string>;
  exposeHostPorts?: boolean;
  skipImagePrepare?: boolean;
}

export interface ImportEnvironmentStatus {
  dockerAvailable: boolean;
  dockerMessage?: string;
  discoveryPaths: string[];
  kindClusterName: string;
  kindAvailable: boolean;
  message?: string;
}

export interface ComposeBuildResult {
  builtImages: string[];
  taggedImages: string[];
}

export interface ComposeUpResult extends ComposeBuildResult {
  started: boolean;
  clusterSync?: ComposeGroupSyncResult;
}

export interface ComposeGroupSyncResult {
  imagesLoaded: string[];
  imagesFailed: Array<{ image: string; error: string }>;
  deploymentsUpdated: Array<{ name: string; image: string }>;
  deploymentsRestarted: string[];
  deploymentsSkipped: string[];
  manifest?: ComposeManifestReconcileResult;
}

export interface ComposeManifestReconcileResult {
  resourcesCreated: number;
  resourcesUpdated: number;
  resourcesRemoved: string[];
}

export interface ComposeRebuildRequest extends ComposeBuildRequest {
  namespace?: string;
  partOf?: string;
  syncToCluster?: boolean;
  clusterContext?: string;
}

export interface ComposeBuildRequest {
  projectId: string;
  imageOverrides?: Record<string, string>;
}

export interface ClusterImageLoadResult {
  loaded: string[];
  failed: Array<{ image: string; error: string }>;
}

export interface ClusterImageLoadRequest {
  images: string[];
  projectId?: string;
  projectName?: string;
  imageOverrides?: Record<string, string>;
}
