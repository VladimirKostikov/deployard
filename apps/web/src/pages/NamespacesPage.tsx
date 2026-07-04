import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Card } from '../components/ui/Card';
import { TableScroll } from '../components/ui/TableScroll';
import { DeleteIcon } from '../components/icons/ActionIcons';
import { HoverTooltip } from '../components/ui/HoverTooltip';
import { ConfirmDialog } from '../features/admin/ConfirmDialog';
import { NamespaceCreateForm } from '../features/namespaces/NamespaceCreateForm';
import { useAppMutation } from '../hooks/use-app-mutation';

const PROTECTED_PREFIX = 'kube-';

export function NamespacesPage() {
  const { t } = useTranslation(['namespaces', 'toast']);
  const queryClient = useQueryClient();
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const namespacesQuery = useQuery({
    queryKey: ['namespaces'],
    queryFn: () => api.getNamespaces(),
  });

  const deleteMutation = useAppMutation({
    mutationFn: (nextName: string) => api.deleteNamespace(nextName),
    successMessage: t('toast:namespace.deleteSuccess'),
    errorMessage: t('toast:namespace.deleteError'),
    onSuccess: async () => {
      setDeletingName(null);
      await queryClient.invalidateQueries({ queryKey: ['namespaces'] });
    },
  });

  const isProtected = (namespaceName: string) => namespaceName.startsWith(PROTECTED_PREFIX);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('title')}</h1>
          <p className="text-sm text-secondary">{t('subtitle')}</p>
        </div>
        <NamespaceCreateForm />
      </div>

      {namespacesQuery.isLoading ? (
        <p className="text-sm text-secondary">{t('loading')}</p>
      ) : namespacesQuery.isError ? (
        <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">{t('error')}</Card>
      ) : (
        <Card className="overflow-hidden">
          <TableScroll>
            <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-canvas text-secondary">
              <tr>
                <th className="px-5 py-3 font-medium">{t('table.name')}</th>
                <th className="px-5 py-3 font-medium">{t('table.status')}</th>
                <th className="px-5 py-3 font-medium">{t('table.created')}</th>
                <th className="px-5 py-3 font-medium">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {(namespacesQuery.data ?? []).map((namespace) => (
                <tr key={namespace.name} className="border-t border-border">
                  <td className="px-5 py-4 font-medium text-primary">{namespace.name}</td>
                  <td className="px-5 py-4">
                    <StatusIndicator
                      variant={namespace.status === 'Active' ? 'ok' : 'warn'}
                      className="text-sm"
                    >
                      {namespace.status}
                    </StatusIndicator>
                  </td>
                  <td className="px-5 py-4 text-secondary">
                    {namespace.createdAt ? new Date(namespace.createdAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {isProtected(namespace.name) ? (
                      <span className="text-xs text-secondary">{t('protected')}</span>
                    ) : (
                      <HoverTooltip label={t('actions.delete')}>
                        <button
                          type="button"
                          onClick={() => setDeletingName(namespace.name)}
                          aria-label={t('actions.delete')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-apple border border-border bg-elevated text-secondary transition-all hover:border-danger/40 hover:bg-danger-soft/40 hover:text-danger hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                        >
                          <DeleteIcon />
                        </button>
                      </HoverTooltip>
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
