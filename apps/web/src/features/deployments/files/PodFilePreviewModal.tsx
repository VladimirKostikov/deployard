import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface PodFilePreviewModalProps {
  open: boolean;
  path: string;
  content: string;
  onClose: () => void;
}

export function PodFilePreviewModal({ open, path, content, onClose }: PodFilePreviewModalProps) {
  const { t } = useTranslation('deployments');

  return (
    <Modal open={open} title={path} onClose={onClose}>
      <pre className="max-h-[28rem] overflow-auto rounded-apple bg-canvas p-3 font-mono text-xs text-primary">
        {content || t('files.previewEmpty')}
      </pre>
    </Modal>
  );
}
