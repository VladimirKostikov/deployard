export interface ComposeRebuildStartOptions {
  projectId: string;
  imageOverrides?: Record<string, string>;
  namespace?: string;
  partOf?: string;
  syncToCluster?: boolean;
  clusterContext?: string;
}
