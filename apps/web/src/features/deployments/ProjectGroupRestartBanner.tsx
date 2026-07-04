import { useTranslation } from 'react-i18next';
import { StatusIndicator } from '../../components/ui/StatusIndicator';

interface ProjectGroupRestartBannerProps {
  restartingCount: number;
  total: number;
  columnCount: number;
}

export function ProjectGroupRestartBanner({
  restartingCount,
  total,
  columnCount,
}: ProjectGroupRestartBannerProps) {
  const { t } = useTranslation('deployments');

  if (restartingCount === 0) {
    return null;
  }

  return (
    <tr className="border-t border-warning/30 bg-warning-soft/50">
      <td colSpan={columnCount} className="px-5 py-2">
        <StatusIndicator variant="warn" pulse className="text-sm font-medium">
          {t('projectGroups.restartingBanner', {
            count: restartingCount,
            total,
          })}
        </StatusIndicator>
      </td>
    </tr>
  );
}
