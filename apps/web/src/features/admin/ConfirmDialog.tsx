import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation('admin');

  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="mb-6 text-sm text-secondary">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('actions.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isPending}>
          {isPending ? t('actions.deleting') : t('actions.delete')}
        </Button>
      </div>
    </Modal>
  );
}
