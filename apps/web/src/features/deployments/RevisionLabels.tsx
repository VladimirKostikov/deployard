import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/ui/Badge';
import { parseRollbackTargetRevision } from './deployment-revision-label';

interface RevisionLabelsProps {
  revision: number;
  changeCause?: string;
  isCurrent?: boolean;
}

export function RevisionLabels({ revision, changeCause, isCurrent = false }: RevisionLabelsProps) {
  const { t } = useTranslation('deployments');
  const rollbackFrom = parseRollbackTargetRevision(changeCause);

  return (
    <div className="leading-tight">
      <div className="flex flex-wrap items-center gap-2">
        <span>v{revision}</span>
        {rollbackFrom ? (
          <span className="text-secondary">← v{rollbackFrom}</span>
        ) : null}
        {isCurrent ? <Badge>{t('history.current')}</Badge> : null}
      </div>
    </div>
  );
}
