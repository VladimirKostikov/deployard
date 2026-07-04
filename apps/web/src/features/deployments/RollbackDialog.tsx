import { useTranslation } from 'react-i18next';
import type { DeploymentRevision } from '@dpd/shared';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface RollbackDialogProps {
  open: boolean;
  revision: DeploymentRevision | null;
  deploymentName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RollbackDialog({
  open,
  revision,
  deploymentName,
  isSubmitting,
  onCancel,
  onConfirm,
}: RollbackDialogProps) {
  const { t } = useTranslation('deployments');

  if (!revision) {
    return null;
  }

  return (
    <Modal
      open={open}
      title={t('rollback.title')}
      onClose={onCancel}
      panelClassName="max-w-md"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <p className="mb-4 text-sm text-secondary">{t('rollback.subtitle', { name: deploymentName })}</p>

      <div className="mb-6 rounded-apple border border-border bg-canvas p-4 text-sm">
        <p className="text-secondary">{t('rollback.targetRevision')}</p>
        <p className="mt-1 font-medium text-primary">v{revision.revision}</p>
        <p className="mt-3 text-secondary">{t('rollback.targetImage')}</p>
        <p className="mt-1 break-all text-primary">{revision.image}</p>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {t('rollback.cancel')}
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? t('rollback.submitting') : t('rollback.confirm')}
        </Button>
      </div>
    </Modal>
  );
}
