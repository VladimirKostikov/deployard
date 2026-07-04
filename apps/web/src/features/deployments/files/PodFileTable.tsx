import type { PodFileEntry } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { TableScroll } from '../../../components/ui/TableScroll';
import { formatFileSize } from './pod-file-utils';

interface PodFileTableProps {
  entries: PodFileEntry[];
  canOperate: boolean;
  onOpen: (entry: PodFileEntry) => void;
  onDownload: (entry: PodFileEntry) => void;
  onRename: (entry: PodFileEntry) => void;
  onDelete: (entry: PodFileEntry) => void;
  isBusy: boolean;
}

export function PodFileTable({
  entries,
  canOperate,
  onOpen,
  onDownload,
  onRename,
  onDelete,
  isBusy,
}: PodFileTableProps) {
  const { t } = useTranslation('deployments');

  if (!entries.length) {
    return <p className="text-sm text-secondary">{t('files.empty')}</p>;
  }

  return (
    <TableScroll>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-canvas text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium">{t('files.columns.name')}</th>
            <th className="px-4 py-3 font-medium">{t('files.columns.size')}</th>
            <th className="px-4 py-3 font-medium">{t('files.columns.modified')}</th>
            <th className="px-4 py-3 font-medium">{t('files.columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.path} className="border-t border-border hover:bg-canvas">
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => onOpen(entry)}
                >
                  {entry.kind === 'directory' ? `${entry.name}/` : entry.name}
                </button>
              </td>
              <td className="px-4 py-3 text-secondary">
                {entry.kind === 'directory' ? '—' : formatFileSize(entry.size)}
              </td>
              <td className="px-4 py-3 text-secondary">{entry.modifiedAt ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {entry.kind === 'file' ? (
                    <Button variant="ghost" size="sm" onClick={() => onDownload(entry)} disabled={isBusy}>
                      {t('files.download')}
                    </Button>
                  ) : null}
                  {canOperate ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onRename(entry)} disabled={isBusy}>
                        {t('files.rename')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(entry)} disabled={isBusy}>
                        {t('files.delete')}
                      </Button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
