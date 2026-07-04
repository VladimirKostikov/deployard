import type { MetricsRouteDetailStat } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { formatMilliseconds } from './metrics-format';

interface MetricsRouteTableProps {
  routes: MetricsRouteDetailStat[];
}

export function MetricsRouteTable({ routes }: MetricsRouteTableProps) {
  const { t } = useTranslation('metrics');

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="font-medium text-primary">{t('sections.routes')}</h2>
        <p className="mt-1 text-xs text-secondary">{t('routes.subtitle')}</p>
      </div>

      {routes.length === 0 ? (
        <p className="p-5 text-sm text-secondary">{t('empty')}</p>
      ) : (
        <TableScroll>
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border bg-canvas text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-5">{t('routes.columns.route')}</th>
                <th className="px-4 py-3 font-medium sm:px-5">{t('routes.columns.requests')}</th>
                <th className="px-4 py-3 font-medium sm:px-5">{t('routes.columns.avgDuration')}</th>
                <th className="px-4 py-3 font-medium sm:px-5">{t('routes.columns.errors')}</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.route} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-primary sm:px-5">{route.route}</td>
                  <td className="px-4 py-3 text-secondary sm:px-5">{route.total}</td>
                  <td className="px-4 py-3 text-secondary sm:px-5">
                    {formatMilliseconds(route.avgDurationSeconds)}
                  </td>
                  <td className="px-4 py-3 text-secondary sm:px-5">
                    {route.errorCount > 0 ? route.errorCount : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}
    </Card>
  );
}
