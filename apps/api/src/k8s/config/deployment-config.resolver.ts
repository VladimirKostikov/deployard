import { ContainerEnvVar, DeploymentConfigSummary, ImageDefaultsResponse } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { mapContainerProbes } from '../mappers/deployment-probe.mapper';
import { resolveContainerRuntimeDefaults } from '../probes/deployment-container.defaults';
import { resolveContainerSetup } from '../probes/deployment-probes';

export function resolveImageDefaults(image: string, containerPort?: number): ImageDefaultsResponse {
  const setup = resolveContainerSetup(image, containerPort);
  const runtime = resolveContainerRuntimeDefaults(image);

  return {
    image,
    containerPort: setup.containerPort,
    probeKind: setup.probeKind,
    env: toEnvVars(runtime.env),
    hint: runtime.hint,
  };
}

export function toDeploymentConfigSummary(deployment: k8s.V1Deployment): DeploymentConfigSummary {
  const container = deployment.spec?.template?.spec?.containers?.[0];
  const ports = container?.ports ?? [];

  return {
    containerPort: ports[0]?.containerPort ?? 80,
    containerName: container?.name ?? deployment.metadata?.name ?? '',
    env: toEnvVars(container?.env ?? []),
    probes: container ? mapContainerProbes(container) : [],
  };
}

export function toEnvVars(items: k8s.V1EnvVar[]): ContainerEnvVar[] {
  return items
    .filter((item) => item.name && item.value !== undefined)
    .map((item) => ({
      name: item.name ?? '',
      value: item.value ?? '',
    }));
}

export function mergeEnvVars(
  defaults: k8s.V1EnvVar[],
  overrides: ContainerEnvVar[],
): k8s.V1EnvVar[] {
  const merged = new Map<string, string>();

  for (const item of defaults) {
    if (item.name && item.value !== undefined) {
      merged.set(item.name, item.value);
    }
  }

  for (const item of overrides) {
    if (item.name.trim()) {
      merged.set(item.name.trim(), item.value);
    }
  }

  return [...merged.entries()].map(([name, value]) => ({ name, value }));
}

export function fromEnvVars(items: ContainerEnvVar[]): k8s.V1EnvVar[] {
  return items
    .filter((item) => item.name.trim())
    .map((item) => ({
      name: item.name.trim(),
      value: item.value,
    }));
}
