import * as k8s from '@kubernetes/client-node';
import { ParsedComposeHealthcheck } from './compose-plan.types';
import { buildProbes, resolveContainerSetup } from '../k8s/probes/deployment-probes';

export function buildProbesFromCompose(
  image: string,
  containerPort: number,
  healthcheck?: ParsedComposeHealthcheck,
): Pick<k8s.V1Container, 'readinessProbe' | 'livenessProbe'> {
  const fromHealthcheck = mapHealthcheckProbe(containerPort, healthcheck);
  if (fromHealthcheck) {
    return fromHealthcheck;
  }

  const setup = resolveContainerSetup(image, containerPort);
  const httpPath = setup.probeKind === 'http' && containerPort === 3000 ? '/health' : '/';
  return buildProbes(setup.probeKind, setup.probePort, { httpPath });
}

function mapHealthcheckProbe(
  containerPort: number,
  healthcheck?: ParsedComposeHealthcheck,
): Pick<k8s.V1Container, 'readinessProbe' | 'livenessProbe'> | null {
  if (!healthcheck?.test.length) {
    return null;
  }

  const joined = healthcheck.test.join(' ').toLowerCase();

  if (joined.includes('curl') || joined.includes('wget')) {
    const pathMatch = joined.match(/\/(?:health|ready|healthz|live|status)/);
    const path = pathMatch?.[0] ?? '/';
    return buildHttpProbes(containerPort, path, healthcheck);
  }

  const command = buildExecProbeCommand(healthcheck.test);
  if (!command.length) {
    return null;
  }

  const probe: k8s.V1Probe = {
    exec: { command },
    initialDelaySeconds: 5,
    periodSeconds: healthcheck.intervalSeconds ?? 5,
    timeoutSeconds: healthcheck.timeoutSeconds ?? 5,
    failureThreshold: healthcheck.retries ?? 3,
  };

  return {
    readinessProbe: probe,
    livenessProbe: {
      ...probe,
      initialDelaySeconds: (healthcheck.intervalSeconds ?? 5) * 2,
    },
  };
}

export function buildExecProbeCommand(test: string[]): string[] {
  const entries = test.map((entry) => entry.trim()).filter(Boolean);
  if (!entries.length) {
    return [];
  }

  const head = entries[0].toUpperCase();

  if (head === 'CMD-SHELL') {
    const script = entries.slice(1).join(' ').trim();
    return script ? ['sh', '-c', script] : [];
  }

  if (head === 'CMD') {
    const commandParts = entries.slice(1);
    if (commandParts.length === 1) {
      return commandParts[0].split(/\s+/).filter(Boolean);
    }
    return commandParts.flatMap((entry) => entry.split(/\s+/)).filter(Boolean);
  }

  if (entries.length === 1) {
    const single = entries[0];
    if (/^CMD-SHELL\s+/i.test(single)) {
      const script = single.replace(/^CMD-SHELL\s+/i, '').trim();
      return script ? ['sh', '-c', script] : [];
    }
    if (/^CMD\s+/i.test(single)) {
      return single.replace(/^CMD\s+/i, '').split(/\s+/).filter(Boolean);
    }
  }

  return entries.flatMap((entry) =>
    entry.replace(/^CMD-SHELL\s+/i, '').replace(/^CMD\s+/i, '').split(/\s+/),
  ).filter(Boolean);
}

function buildHttpProbes(
  containerPort: number,
  path: string,
  healthcheck: ParsedComposeHealthcheck,
): Pick<k8s.V1Container, 'readinessProbe' | 'livenessProbe'> {
  const readinessProbe: k8s.V1Probe = {
    httpGet: { path, port: containerPort },
    initialDelaySeconds: 5,
    periodSeconds: healthcheck.intervalSeconds ?? 5,
    timeoutSeconds: healthcheck.timeoutSeconds ?? 5,
    failureThreshold: healthcheck.retries ?? 3,
  };

  return {
    readinessProbe,
    livenessProbe: {
      ...readinessProbe,
      initialDelaySeconds: (healthcheck.intervalSeconds ?? 5) * 2,
    },
  };
}
