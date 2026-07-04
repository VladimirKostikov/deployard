import { AppSection } from '@dpd/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { DeleteIcon } from '../../components/icons/ActionIcons';
import { HoverTooltip } from '../../components/ui/HoverTooltip';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { ConfirmDialog } from '../admin/ConfirmDialog';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { useSectionAccess } from '../../auth/use-access';
import { IngressCreateForm } from '../ingress/IngressCreateForm';

interface NetworkIngressPanelProps {
  namespace: string;
  canManage?: boolean;
}

export function NetworkIngressPanel({ namespace, canManage: canManageProp }: NetworkIngressPanelProps) {
  const { t } = useTranslation(['ingress', 'toast']);
  const { canManage: canManageAccess } = useSectionAccess(AppSection.NETWORK, namespace);
  const canManage = canManageProp ?? canManageAccess;
  const queryClient = useQueryClient();
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const ingressQuery = useQuery({
    queryKey: ['ingress', namespace],
    queryFn: () => api.getIngresses(namespace),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (ingressName: string) => api.deleteIngress(namespace, ingressName),
    successMessage: t('toast:network.ingressDeleteSuccess'),
    errorMessage: t('toast:network.ingressDeleteError'),
    onSuccess: async () => {
      setDeletingName(null);
      await queryClient.invalidateQueries({ queryKey: ['ingress', namespace] });
    },
  });

  if (ingressQuery.isLoading) {
    return <p className="text-sm text-secondary">{t('loading')}</p>;
  }

  if (ingressQuery.isError) {
    return <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">{t('error')}</Card>;
  }

  const ingresses = ingressQuery.data ?? [];

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex justify-end">
          <IngressCreateForm namespace={namespace} />
        </div>
      ) : null}

      {!ingresses.length ? (
        <Card className="p-6 text-sm text-secondary">{t('empty')}</Card>
      ) : (
        <Card className="overflow-hidden">
          <TableScroll>
            <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border bg-canvas text-secondary">
              <tr>
                <th className="px-5 py-3 font-medium">{t('table.name')}</th>
                <th className="px-5 py-3 font-medium">{t('table.host')}</th>
                <th className="px-5 py-3 font-medium">{t('table.path')}</th>
                <th className="px-5 py-3 font-medium">{t('table.service')}</th>
                <th className="px-5 py-3 font-medium">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {ingresses.map((ingress) => (
                <tr key={ingress.name} className="border-t border-border">
                  <td className="px-5 py-4 font-medium text-primary">{ingress.name}</td>
                  <td className="px-5 py-4 text-secondary">{ingress.hosts.join(', ') || '—'}</td>
                  <td className="px-5 py-4 text-secondary">{ingress.paths.join(', ') || '—'}</td>
                  <td className="px-5 py-4 text-secondary">
                    {ingress.serviceName ? `${ingress.serviceName}:${ingress.servicePort}` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {canManage ? (
                      <HoverTooltip label={t('actions.delete')}>
                        <button
                          type="button"
                          onClick={() => setDeletingName(ingress.name)}
                          aria-label={t('actions.delete')}
                          className="inline-flex h-8 w-8 items-center justify-center border border-border bg-elevated text-secondary transition-all hover:border-danger/40 hover:bg-danger-soft/40 hover:text-danger"
                        >
                          <DeleteIcon />
                        </button>
                      </HoverTooltip>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </TableScroll>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deletingName)}
        title={t('delete.title')}
        message={t('delete.message', { name: deletingName ?? '' })}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeletingName(null)}
        onConfirm={() => deletingName && deleteMutation.mutate(deletingName)}
      />
    </div>
  );
}
