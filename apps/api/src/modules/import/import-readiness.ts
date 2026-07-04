import { K8sService } from '../../k8s/k8s.service';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForDeploymentsReady(
  k8sService: K8sService,
  namespace: string,
  names: string[],
  timeoutMs = 120_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const targets = [...new Set(names)];

  while (Date.now() < deadline) {
    const statuses = await Promise.all(
      targets.map(async (name) => {
        try {
          const deployment = await k8sService.apps.readNamespacedDeployment({ name, namespace });
          const desired = deployment.spec?.replicas ?? 0;
          const ready = deployment.status?.readyReplicas ?? 0;
          return desired === 0 || ready >= desired;
        } catch {
          return false;
        }
      }),
    );

    if (statuses.every(Boolean)) {
      return;
    }

    await sleep(1_500);
  }
}
