import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DeploymentSummary } from '@dpd/shared';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Modal } from '../../components/ui/Modal';
import { isDeploymentRolloutInProgress } from './deployment-rollout';
import {
  collectStatusReasons,
  deploymentStatusVariant,
  resolveDeploymentDisplayState,
} from './deployment-status-insight';
import { DeploymentStatusPods } from './DeploymentStatusPods';

interface DeploymentStatusDialogProps {
  deployment: DeploymentSummary;
  restartPending?: boolean;
}

export function DeploymentStatusDialog({
  deployment,
  restartPending = false,
}: DeploymentStatusDialogProps) {
  const { t } = useTranslation('deployments');
  const [open, setOpen] = useState(false);
  const state = resolveDeploymentDisplayState(deployment, restartPending);
  const reasons = collectStatusReasons(deployment);
  const rolloutActive = restartPending || isDeploymentRolloutInProgress(deployment);
  const showPulse = state === 'starting' || state === 'restarting';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left underline-offset-2 hover:underline"
        aria-label={t('statusModal.open')}
      >
        <StatusIndicator variant={deploymentStatusVariant(state)} pulse={showPulse}>
          {t(`status.${state}`)}
        </StatusIndicator>
      </button>

      <Modal open={open} title={t('statusModal.title')} onClose={() => setOpen(false)}>
        <div className="space-y-4 text-sm">
          <p className="text-secondary">
            {state === 'restarting'
              ? t('statusModal.summary.restarting', {
                  ready: deployment.readyReplicas,
                  desired: deployment.replicas,
                  updated: deployment.updatedReplicas,
                })
              : t(`statusModal.summary.${state}`)}
          </p>

          <dl className="grid grid-cols-2 gap-3 border border-border bg-canvas p-4">
            <Stat label={t('statusModal.desired')} value={deployment.replicas} />
            <Stat label={t('statusModal.ready')} value={deployment.readyReplicas} />
            <Stat label={t('statusModal.available')} value={deployment.availableReplicas} />
            <Stat label={t('statusModal.updated')} value={deployment.updatedReplicas} />
          </dl>

          <div className="space-y-2">
            <p className="font-medium text-primary">{t('statusModal.reasonsTitle')}</p>
            <ul className="list-disc space-y-1 pl-5 text-secondary">
              {state === 'restarting' ? (
                <li>
                  {t('statusModal.reasons.restarting', {
                    ready: deployment.readyReplicas,
                    desired: deployment.replicas,
                    updated: deployment.updatedReplicas,
                  })}
                </li>
              ) : (
                reasons.map((reason) => (
                  <li key={reason}>
                    {t(`statusModal.reasons.${reason}`, {
                      ready: deployment.readyReplicas,
                      desired: deployment.replicas,
                      available: deployment.availableReplicas,
                      updated: deployment.updatedReplicas,
                      replicas: deployment.previousReplicas ?? 1,
                    })}
                  </li>
                ))
              )}
            </ul>
          </div>

          {rolloutActive ? (
            <DeploymentStatusPods
              namespace={deployment.namespace}
              deploymentName={deployment.name}
              enabled={open}
            />
          ) : null}
        </div>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-secondary">{label}</dt>
      <dd className="text-lg font-semibold text-primary">{value}</dd>
    </div>
  );
}
