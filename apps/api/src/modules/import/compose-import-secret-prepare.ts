import { composeK8sSecretName } from '@dpd/shared';
import type { ComposeK8sServicePlan } from '../../compose/compose-plan.types';
import type { SecretsRepository } from '../../k8s/repositories/secrets.repository';
import { K8sService } from '../../k8s/k8s.service';

export async function prepareComposeServiceSecrets(
  namespace: string,
  projectName: string,
  services: ComposeK8sServicePlan[],
  secretsRepository: SecretsRepository,
  k8sService: K8sService,
): Promise<Array<{ name: string; action: 'created' | 'updated' }>> {
  const applied: Array<{ name: string; action: 'created' | 'updated' }> = [];

  for (const service of services) {
    if (Object.keys(service.environment).length === 0) {
      continue;
    }

    const secretName = composeK8sSecretName(projectName, service.name);
    const secretData = await resolveSecretData(
      namespace,
      secretName,
      service.environment,
      k8sService,
    );
    const action = await secretsRepository.upsertOpaque(namespace, secretName, secretData);
    await waitForSecret(namespace, secretName, k8sService);
    applied.push({ name: secretName, action });
  }

  return applied;
}

async function resolveSecretData(
  namespace: string,
  targetName: string,
  composeData: Record<string, string>,
  k8sService: K8sService,
): Promise<Record<string, string>> {
  if (await secretExists(namespace, targetName, k8sService)) {
    return composeData;
  }

  if (!targetName.endsWith('-env')) {
    return composeData;
  }

  const legacyName = `${targetName.slice(0, -4)}-secret`;
  const legacyData = await readSecretStringData(namespace, legacyName, k8sService);
  return legacyData ?? composeData;
}

async function secretExists(
  namespace: string,
  name: string,
  k8sService: K8sService,
): Promise<boolean> {
  try {
    await k8sService.core.readNamespacedSecret({ name, namespace });
    return true;
  } catch {
    return false;
  }
}

async function readSecretStringData(
  namespace: string,
  name: string,
  k8sService: K8sService,
): Promise<Record<string, string> | null> {
  try {
    const secret = await k8sService.core.readNamespacedSecret({ name, namespace });
    if (secret.stringData && Object.keys(secret.stringData).length > 0) {
      return secret.stringData;
    }

    const decoded: Record<string, string> = {};
    for (const [key, value] of Object.entries(secret.data ?? {})) {
      if (!value) {
        continue;
      }
      decoded[key] = Buffer.from(value, 'base64').toString('utf8');
    }

    return Object.keys(decoded).length > 0 ? decoded : null;
  } catch {
    return null;
  }
}

async function waitForSecret(
  namespace: string,
  name: string,
  k8sService: K8sService,
): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (await secretExists(namespace, name, k8sService)) {
      return;
    }
    await delay(100);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
