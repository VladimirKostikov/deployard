import { useTranslation } from 'react-i18next';
import type { EndpointSummary } from '@dpd/shared';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';

interface EndpointTableProps {
  endpoints: EndpointSummary[];
}

function formatAddresses(endpoint: EndpointSummary) {
  if (!endpoint.addresses.length) {
    return '—';
  }

  return endpoint.addresses
    .map((address) => {
      const pod = address.podName ? ` (${address.podName})` : '';
      const ready = address.ready ? '' : ' [not ready]';
      return `${address.ip}${pod}${ready}`;
    })
    .join(', ');
}

function formatPorts(ports: EndpointSummary['ports']) {
  if (!ports.length) {
    return '—';
  }

  return ports.map((port) => String(port.port)).join(', ');
}

export function EndpointTable({ endpoints }: EndpointTableProps) {
  const { t } = useTranslation('network');

  if (!endpoints.length) {
    return <Card className="p-6 text-sm text-secondary">{t('endpoints.empty')}</Card>;
  }

  return (
    <Card className="overflow-hidden">
      <TableScroll>
        <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-border bg-canvas text-secondary">
          <tr>
            <th className="px-5 py-3 font-medium">{t('endpoints.table.name')}</th>
            <th className="px-5 py-3 font-medium">{t('endpoints.table.ports')}</th>
            <th className="px-5 py-3 font-medium">{t('endpoints.table.addresses')}</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((endpoint) => (
            <tr key={endpoint.name} className="border-t border-border">
              <td className="px-5 py-4 font-medium text-primary">{endpoint.name}</td>
              <td className="px-5 py-4 text-secondary">{formatPorts(endpoint.ports)}</td>
              <td className="px-5 py-4 font-mono text-xs text-secondary">{formatAddresses(endpoint)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </TableScroll>
    </Card>
  );
}
