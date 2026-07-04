import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';

interface PodFileToolbarProps {
  canOperate: boolean;
  onRefresh: () => void;
  onCreateFolder: () => void;
  onUpload: (file: File) => void;
  isBusy: boolean;
}

export function PodFileToolbar({
  canOperate,
  onRefresh,
  onCreateFolder,
  onUpload,
  isBusy,
}: PodFileToolbarProps) {
  const { t } = useTranslation('deployments');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onRefresh} disabled={isBusy}>
        {t('files.refresh')}
      </Button>
      {canOperate ? (
        <>
          <Button variant="secondary" size="sm" onClick={onCreateFolder} disabled={isBusy}>
            {t('files.newFolder')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => inputRef.current?.click()} disabled={isBusy}>
            {t('files.upload')}
          </Button>
        </>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpload(file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}
