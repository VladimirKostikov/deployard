import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { DeploymentSummary } from '@dpd/shared';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { RevisionLabels } from './RevisionLabels';
import { DeploymentStatusDialog } from './DeploymentStatusDialog';
import { DeploymentTableActions } from './DeploymentTableActions';

interface DeploymentTableProps {
  deployments: DeploymentSummary[];
  showProject?: boolean;
}

export function DeploymentTable({ deployments, showProject = false }: DeploymentTableProps) {
  const { t } = useTranslation('deployments');

  return (
    <Card className="overflow-hidden" data-testid="deployment-list">
      <TableScroll>
        <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-canvas text-secondary">
          <tr>
            <th className="px-5 py-3 font-medium">{t('table.name')}</th>
            {showProject && (
              <th className="px-5 py-3 font-medium">{t('table.project')}</th>
            )}
            <th className="px-5 py-3 font-medium">{t('table.image')}</th>
            <th className="px-5 py-3 font-medium">{t('table.replicas')}</th>
            <th className="px-5 py-3 font-medium">{t('table.revision')}</th>
            <th className="px-5 py-3 font-medium">{t('table.status')}</th>
            <th className="px-5 py-3 font-medium">{t('actions.label')}</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((deployment) => (
              <tr
                key={deployment.name}
                className="border-t border-border transition-colors hover:bg-canvas"
              >
                <td className="px-5 py-4">
                  <Link
                    to={`/deployments/${deployment.name}`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {deployment.name}
                  </Link>
                </td>
                {showProject && (
                  <td className="px-5 py-4 text-secondary">
                    {deployment.partOf ?? t('projectFilter.standalone')}
                  </td>
                )}
                <td className="px-5 py-4 text-secondary">{deployment.image}</td>
                <td className="px-5 py-4 text-secondary">
                  {deployment.readyReplicas}/{deployment.replicas}
                </td>
                <td className="px-5 py-4 text-secondary">
                  <RevisionLabels
                    revision={deployment.revision}
                    changeCause={deployment.changeCause}
                  />
                </td>
                <td className="px-5 py-4">
                  <DeploymentStatusDialog deployment={deployment} />
                </td>
                <td className="px-5 py-4">
                  <DeploymentTableActions
                    namespace={deployment.namespace}
                    name={deployment.name}
                    deployment={deployment}
                  />
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      </TableScroll>
    </Card>
  );
}
