import {
  DeploymentProbeConfig,
  ProbeMechanism,
  ProbeType,
} from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';

export function mapContainerProbes(container: k8s.V1Container): DeploymentProbeConfig[] {
  const probes: DeploymentProbeConfig[] = [];

  if (container.readinessProbe) {
    probes.push(mapProbe('readiness', container.readinessProbe));
  }
  if (container.livenessProbe) {
    probes.push(mapProbe('liveness', container.livenessProbe));
  }
  if (container.startupProbe) {
    probes.push(mapProbe('startup', container.startupProbe));
  }

  return probes;
}

function mapProbe(type: ProbeType, probe: k8s.V1Probe): DeploymentProbeConfig {
  const mechanism = resolveMechanism(probe);

  return {
    type,
    mechanism,
    path: probe.httpGet?.path,
    port: resolvePort(probe),
    command: probe.exec?.command,
    initialDelaySeconds: probe.initialDelaySeconds,
    periodSeconds: probe.periodSeconds,
    timeoutSeconds: probe.timeoutSeconds,
    successThreshold: probe.successThreshold,
    failureThreshold: probe.failureThreshold,
  };
}

function resolveMechanism(probe: k8s.V1Probe): ProbeMechanism {
  if (probe.httpGet) {
    return 'http';
  }
  if (probe.tcpSocket) {
    return 'tcp';
  }
  if (probe.exec) {
    return 'exec';
  }
  if (probe.grpc) {
    return 'grpc';
  }
  return 'none';
}

function resolvePort(probe: k8s.V1Probe): number | undefined {
  const raw = probe.httpGet?.port ?? probe.tcpSocket?.port ?? probe.grpc?.port;
  if (typeof raw === 'number') {
    return raw;
  }
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
