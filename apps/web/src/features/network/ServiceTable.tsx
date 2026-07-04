import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { ServiceSummary } from '@dpd/shared';
import { api } from '../../api';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { groupServicesByProject } from './resolve-service-project-group';
import { ServiceAccessButton } from './ServiceAccessButton';
import { ServiceAccessUrl } from './ServiceAccessUrl';
import { ServiceEditDialog } from './ServiceEditDialog';
import { ServiceTableRow } from './ServiceTableRow';

interface ServiceTableProps {
  namespace: string;
  services: ServiceSummary[];
}

function formatSelector(selector: Record<string, string>) {
  const entries = Object.entries(selector);
  if (!entries.length) {
    return '-';
  }

  return entries.map(([key, value]) => `${key}=${value}`).join(', ');
}

function formatPorts(ports: ServiceSummary['ports']) {
  if (!ports.length) {
    return '-';
  }

  return ports
    .map((port) => {
      const mapping = `${port.port}→${port.targetPort}`;
      return port.nodePort ? `${mapping} (:${port.nodePort})` : mapping;
    })
    .join(', ');
}

export function ServiceTable({ namespace, services }: ServiceTableProps) {
  const { t } = useTranslation(['network', 'toast']);
  const queryClient = useQueryClient();
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceSummary | null>(null);
  const groups = useMemo(() => groupServicesByProject(services), [services]);

  const deleteMutation = useAppMutation({
    mutationFn: (serviceName: string) => api.deleteService(namespace, serviceName),
    successMessage: t('toast:network.serviceDeleteSuccess'),
    errorMessage: t('toast:network.serviceDeleteError'),
    onSuccess: async () => {
      setDeletingName(null);
      await queryClient.invalidateQueries({ queryKey: ['network', 'services', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['network', 'endpoints', namespace] });
    },
  });

  if (!services.length) {
    return <Card className="p-6 text-sm text-secondary">{t('services.empty')}</Card>;
  }

  return (
    <>
      <Card className="overflow-hidden">
        <TableScroll>
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-border bg-canvas text-secondary">
              <tr>
                <th className="px-5 py-3 font-medium">{t('services.table.name')}</th>
                <th className="px-5 py-3 font-medium">{t('services.table.type')}</th>
                <th className="px-5 py-3 font-medium">{t('services.table.clusterIp')}</th>
                <th className="px-5 py-3 font-medium">{t('services.table.ports')}</th>
                <th className="px-5 py-3 font-medium">{t('services.table.selector')}</th>
                <th className="px-5 py-3 font-medium">{t('services.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <ServiceProjectGroupRows
                  key={group.key}
                  namespace={namespace}
                  groupLabel={group.label}
                  serviceCount={group.services.length}
                  services={group.services}
                  onEdit={setEditingService}
                  onDelete={setDeletingName}
                />
              ))}
            </tbody>
          </table>
        </TableScroll>
      </Card>

      <ConfirmDialog
        open={Boolean(deletingName)}
        title={t('services.delete.title')}
        message={t('services.delete.message', { name: deletingName ?? '' })}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeletingName(null)}
        onConfirm={() => deletingName && deleteMutation.mutate(deletingName)}
      />

      {editingService && (
        <ServiceEditDialog
          service={editingService}
          open={Boolean(editingService)}
          onClose={() => setEditingService(null)}
          onSaved={async () => {
            await queryClient.invalidateQueries({ queryKey: ['network', 'services', namespace] });
          }}
        />
      )}
    </>
  );
}

interface ServiceProjectGroupRowsProps {
  namespace: string;
  groupLabel: string;
  serviceCount: number;
  services: ServiceSummary[];
  onEdit: (service: ServiceSummary) => void;
  onDelete: (serviceName: string) => void;
}

function ServiceProjectGroupRows({
  namespace,
  groupLabel,
  serviceCount,
  services,
  onEdit,
  onDelete,
}: ServiceProjectGroupRowsProps) {
  const { t } = useTranslation('network');
  const showGroupHeader = serviceCount > 1 || services[0]?.name !== groupLabel;

  return (
    <>
      {showGroupHeader ? (
        <tr className="border-t border-border bg-elevated/60">
          <td colSpan={6} className="px-5 py-2.5">
            <span className="font-medium text-primary">{groupLabel}</span>
            <span className="ml-2 text-xs text-secondary">
              {t('services.groups.count', { count: serviceCount })}
            </span>
          </td>
        </tr>
      ) : null}
      {services.map((service) => (
        <ServiceTableRow
          key={service.name}
          namespace={namespace}
          service={service}
          formatPorts={formatPorts}
          formatSelector={formatSelector}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

interface DeploymentServiceListProps {
  services: ServiceSummary[];
}

export function DeploymentServiceList({ services }: DeploymentServiceListProps) {
  const { t } = useTranslation('network');

  if (!services.length) {
    return <p className="text-sm text-secondary">{t('deployment.empty')}</p>;
  }

  return (
    <ul className="space-y-2">
      {services.map((service) => (
        <li key={service.name} className="border border-border bg-canvas px-4 py-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="font-medium text-primary">{service.name}</span>
            <div className="flex flex-col items-end gap-1.5">
              <ServiceAccessUrl service={service} />
              <div className="flex flex-wrap items-center gap-2">
                <ServiceAccessButton service={service} />
                <Link to={`/network?tab=endpoints`} className="text-xs text-accent underline-offset-2 hover:underline">
                  {t('deployment.viewEndpoints')}
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-1 text-xs text-secondary">
            {service.clusterIp || '-'} · {formatPorts(service.ports)}
          </p>
        </li>
      ))}
    </ul>
  );
}
