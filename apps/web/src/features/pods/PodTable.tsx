import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePodWatch, usePods } from '../../hooks/kubernetes';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { PodRowActions } from './PodRowActions';

interface PodTableProps {
  namespace: string;
  deploymentName: string;
}

export function PodTable({ namespace, deploymentName }: PodTableProps) {
  const { t } = useTranslation('pods');
  const { name = deploymentName } = useParams();
  const deployment = deploymentName || name;
  usePodWatch(namespace, deployment);
  const { data, isLoading, isError } = usePods(namespace, deployment);

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('loading')}</p>;
  }

  if (isError) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('error')}
      </Card>
    );
  }

  if (!data?.length) {
    return <Card className="p-6 text-sm text-secondary">{t('empty')}</Card>;
  }

  return (
    <Card className="overflow-hidden" data-testid="pod-table">
      <TableScroll>
        <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="border-b border-border text-secondary">
          <tr>
            <th className="px-5 py-3 font-medium">{t('table.name')}</th>
            <th className="px-5 py-3 font-medium">{t('table.phase')}</th>
            <th className="px-5 py-3 font-medium">{t('table.ready')}</th>
            <th className="px-5 py-3 font-medium">{t('table.restarts')}</th>
            <th className="px-5 py-3 font-medium">{t('table.node')}</th>
            <th className="px-5 py-3 font-medium">{t('table.podIp')}</th>
            <th className="px-5 py-3 font-medium">{t('table.ports')}</th>
            <th className="px-5 py-3 font-medium">{t('table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((pod) => (
            <tr key={pod.name} className="border-t border-border">
              <td className="px-5 py-4 font-medium text-primary">{pod.name}</td>
              <td className="px-5 py-4 text-secondary">{pod.phase}</td>
              <td className="px-5 py-4 text-secondary">{pod.ready ? t('yes') : t('no')}</td>
              <td className="px-5 py-4 text-secondary">{pod.restarts}</td>
              <td className="px-5 py-4 text-secondary">{pod.nodeName ?? '—'}</td>
              <td className="px-5 py-4 font-mono text-xs text-secondary">{pod.podIp ?? '—'}</td>
              <td className="px-5 py-4 text-secondary">{pod.ports?.length ? pod.ports.join(', ') : '—'}</td>
              <td className="px-5 py-4">
                <PodRowActions namespace={namespace} deploymentName={deployment} pod={pod} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </TableScroll>
    </Card>
  );
}
