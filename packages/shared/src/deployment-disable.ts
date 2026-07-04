export const DEPLOYMENT_DISABLED_ANNOTATION = 'deployard.io/disabled';
export const DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION = 'deployard.io/previous-replicas';
export const DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION = 'deployard.io/disabled-with-errors';

export function readDeploymentDisableState(annotations: Record<string, string> | undefined): {
  disabled: boolean;
  previousReplicas?: number;
  disabledWithErrors: boolean;
} {
  const disabled = annotations?.[DEPLOYMENT_DISABLED_ANNOTATION] === 'true';
  const raw = annotations?.[DEPLOYMENT_PREVIOUS_REPLICAS_ANNOTATION];
  const parsed = raw ? Number(raw) : NaN;
  const previousReplicas = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  const disabledWithErrors =
    annotations?.[DEPLOYMENT_DISABLED_WITH_ERRORS_ANNOTATION] === 'true';

  return { disabled, previousReplicas, disabledWithErrors };
}
