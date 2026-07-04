import { useTranslation } from 'react-i18next';
import type { DeploymentRevision } from '@dpd/shared';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { RevisionLabels } from './RevisionLabels';

interface DeploymentHistoryTableProps {
  revisions: DeploymentRevision[];
  currentRevision: number;
  isRollbackPending: boolean;
  canRollback: boolean;
  onRollback: (revision: DeploymentRevision) => void;
}

export function DeploymentHistoryTable({
  revisions,
  currentRevision,
  isRollbackPending,
  canRollback,
  onRollback,
}: DeploymentHistoryTableProps) {
  const { t } = useTranslation('deployments');

  return (
    <Card className="overflow-hidden">
      <TableScroll>
        <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-canvas text-secondary">
          <tr>
            <th className="px-5 py-3 font-medium">{t('history.table.revision')}</th>
            <th className="px-5 py-3 font-medium">{t('history.table.image')}</th>
            <th className="px-5 py-3 font-medium">{t('history.table.replicas')}</th>
            <th className="px-5 py-3 font-medium">{t('history.table.created')}</th>
            <th className="px-5 py-3 font-medium">{t('history.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {revisions.map((revision) => {
            const isCurrent = revision.revision === currentRevision;

            return (
              <tr key={revision.revision} className="border-t border-border">
                <td className="px-5 py-4 text-primary">
                  <RevisionLabels
                    revision={revision.revision}
                    changeCause={revision.changeCause}
                    isCurrent={isCurrent}
                  />
                </td>
                <td className="px-5 py-4 text-secondary">{revision.image}</td>
                <td className="px-5 py-4 text-secondary">{revision.replicas}</td>
                <td className="px-5 py-4 text-secondary">
                  {revision.createdAt ? new Date(revision.createdAt).toLocaleString() : '—'}
                </td>
                <td className="px-5 py-4">
                  {canRollback ? (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isCurrent || isRollbackPending}
                      onClick={() => onRollback(revision)}
                    >
                      {t('history.rollback')}
                    </Button>
                  ) : (
                    <span className="text-xs text-secondary">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </TableScroll>
    </Card>
  );
}
