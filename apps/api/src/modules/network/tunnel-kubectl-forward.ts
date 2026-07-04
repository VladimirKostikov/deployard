import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { K8sService } from '../../k8s/k8s.service';
import type { TunnelRecord } from './tunnel-record';
import { toTunnelSummary, waitForTunnelReady } from './tunnel-record';
import type { ServiceTunnelSummary } from '@dpd/shared';
import type { TunnelPortRegistry } from './tunnel-port-registry';

export async function startKubectlForward(
  k8sService: K8sService,
  portRegistry: TunnelPortRegistry,
  tunnels: Map<string, TunnelRecord>,
  namespace: string,
  serviceName: string,
  servicePort: number,
  localPort: number,
  cluster?: string,
): Promise<ServiceTunnelSummary> {
  const id = randomUUID();
  const kubeContext = cluster || k8sService.getKubeConfig().getCurrentContext();
  const kubeConfigPath = writeKubeConfigFile(k8sService, kubeContext);
  const args = [
    'port-forward',
    '--kubeconfig',
    kubeConfigPath,
    '--context',
    kubeContext,
    '--address',
    '0.0.0.0',
    `svc/${serviceName}`,
    `${localPort}:${servicePort}`,
    '-n',
    namespace,
  ];

  const child = spawn('kubectl', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  const record: TunnelRecord = {
    id,
    namespace,
    serviceName,
    servicePort,
    localPort,
    cluster,
    status: 'starting',
    process: child,
  };

  tunnels.set(id, record);

  child.stdout?.on('data', (chunk: Buffer) => {
    if (chunk.toString().includes('Forwarding from')) {
      record.status = 'active';
      record.error = undefined;
    }
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString().trim();
    if (text) {
      record.status = 'error';
      record.error = text;
    }
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      record.status = 'error';
      record.error = record.error ?? `kubectl exited with code ${code}`;
    }

    if (tunnels.get(id)?.process === child) {
      tunnels.delete(id);
      portRegistry.releasePortBinding(record);
    }
  });

  await waitForTunnelReady(record, 8_000);
  return toTunnelSummary(record);
}

function writeKubeConfigFile(k8sService: K8sService, context: string): string {
  const kubeConfig = k8sService.getKubeConfigForContext(context);
  const dir = mkdtempSync(join(tmpdir(), 'dpd-kube-'));
  const path = join(dir, 'config');
  writeFileSync(path, kubeConfig.exportConfig(), 'utf8');
  return path;
}
