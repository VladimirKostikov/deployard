import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DeploymentRevision } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useSectionAccess } from '../../auth/use-access';
import { useDeploymentHistory, useRollbackDeployment } from '../../hooks/kubernetes';
import { Card } from '../../components/ui/Card';
import { DeploymentHistoryTable } from './DeploymentHistoryTable';
import { RollbackDialog } from './RollbackDialog';

interface DeploymentHistoryProps {
  namespace: string;
  deploymentName: string;
  currentRevision: number;
}

export function DeploymentHistory({
  namespace,
  deploymentName,
  currentRevision,
}: DeploymentHistoryProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const { data, isLoading, isError } = useDeploymentHistory(namespace, deploymentName);
  const rollback = useRollbackDeployment(namespace, deploymentName, {
    success: t('toast:deployment.rollbackSuccess'),
    error: t('toast:deployment.rollbackError'),
  });
  const [selectedRevision, setSelectedRevision] = useState<DeploymentRevision | null>(null);

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('history.loading')}</p>;
  }

  if (isError) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('history.error')}
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="p-6 text-sm text-secondary">
        {t('history.empty')}
      </Card>
    );
  }

  const handleConfirmRollback = async () => {
    if (!selectedRevision) {
      return;
    }

    await rollback.mutateAsync(selectedRevision.revision);
    setSelectedRevision(null);
  };

  return (
    <div className="space-y-4">
      <DeploymentHistoryTable
        revisions={data}
        currentRevision={currentRevision}
        isRollbackPending={rollback.isPending}
        canRollback={canOperate}
        onRollback={setSelectedRevision}
      />

      <RollbackDialog
        open={selectedRevision !== null}
        revision={selectedRevision}
        deploymentName={deploymentName}
        isSubmitting={rollback.isPending}
        onCancel={() => setSelectedRevision(null)}
        onConfirm={() => void handleConfirmRollback()}
      />
    </div>
  );
}
