import * as k8s from '@kubernetes/client-node';

export function withInsecureTls(cluster: k8s.Cluster): k8s.Cluster {
  return {
    ...cluster,
    skipTLSVerify: true,
    caData: undefined,
    caFile: undefined,
  };
}
