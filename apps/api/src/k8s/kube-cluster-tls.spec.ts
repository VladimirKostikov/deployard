import * as k8s from '@kubernetes/client-node';
import { describe, expect, it } from 'vitest';
import { withInsecureTls } from './kube-cluster-tls';

describe('withInsecureTls', () => {
  it('removes CA fields when skipping TLS verification', () => {
    const cluster: k8s.Cluster = {
      name: 'kind-local',
      server: 'https://127.0.0.1:6443',
      caData: 'abc',
      caFile: '/tmp/ca',
    };

    const result = withInsecureTls(cluster);

    expect(result.skipTLSVerify).toBe(true);
    expect(result.caData).toBeUndefined();
    expect(result.caFile).toBeUndefined();
    expect(result.server).toBe(cluster.server);
  });
});
