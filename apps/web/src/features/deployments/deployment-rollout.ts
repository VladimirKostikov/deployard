import type { DeploymentSummary } from '@dpd/shared';

export function isDeploymentRolloutInProgress(deployment: DeploymentSummary): boolean {
  if (deployment.replicas === 0) {
    return false;
  }

  return (
    deployment.updatedReplicas < deployment.replicas ||
    deployment.readyReplicas < deployment.replicas
  );
}
