import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { AdminRole } from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { AdminPageHeader } from '../../features/admin/AdminPageHeader';
import { AdminRowActions } from '../../features/admin/AdminRowActions';
import { ConfirmDialog } from '../../features/admin/ConfirmDialog';
import { PermissionTag } from '../../features/admin/PermissionTag';
import { RoleFormModal } from '../../features/admin/RoleFormModal';
import { useAppMutation } from '../../hooks/use-app-mutation';

export function AdminRolesPage() {
  const { t } = useTranslation(['admin', 'toast']);
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<AdminRole | null>(null);

  const rolesQuery = useQuery({ queryKey: ['admin', 'roles'], queryFn: () => api.getAdminRoles() });

  const saveMutation = useAppMutation({
    mutationFn: (payload: {
      name: string;
      access: Array<{ section: AdminRole['permissions'][number]['section']; level: AdminRole['permissions'][number]['level'] }>;
    }) => {
      if (editingRole) {
        return api.updateAdminRole(editingRole.id, payload);
      }

      return api.createAdminRole(payload);
    },
    successMessage: t('toast:admin.roleSaveSuccess'),
    errorMessage: t('toast:admin.roleSaveError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setFormOpen(false);
      setEditingRole(null);
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => api.deleteAdminRole(id),
    successMessage: t('toast:admin.roleDeleteSuccess'),
    errorMessage: t('toast:admin.roleDeleteError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setDeletingRole(null);
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('roles.title')}
        subtitle={t('roles.subtitle')}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingRole(null);
              setFormOpen(true);
            }}
          >
            {t('roles.create')}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableScroll>
          <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="w-36 px-5 py-3 font-semibold">{t('roles.name')}</th>
              <th className="px-5 py-3 font-semibold">{t('roles.permissions')}</th>
              <th className="w-40 px-5 py-3 font-semibold">{t('actions.label')}</th>
            </tr>
          </thead>
          <tbody>
            {(rolesQuery.data ?? []).map((role) => (
              <tr key={role.id} className="border-t border-border align-top hover:bg-canvas">
                <td className="px-5 py-4 font-semibold capitalize text-primary">{role.name}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((permission) => (
                      <PermissionTag
                        key={permission.id}
                        section={permission.section}
                        level={permission.level}
                        namespace={permission.namespace}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <AdminRowActions
                    editLabel={t('actions.edit')}
                    deleteLabel={t('actions.delete')}
                    onEdit={() => {
                      setEditingRole(role);
                      setFormOpen(true);
                    }}
                    onDelete={() => setDeletingRole(role)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableScroll>
      </Card>

      <RoleFormModal
        open={formOpen}
        role={editingRole}
        isPending={saveMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditingRole(null);
        }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={Boolean(deletingRole)}
        title={t('roles.deleteTitle')}
        message={t('roles.deleteMessage', { name: deletingRole?.name ?? '' })}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeletingRole(null)}
        onConfirm={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
      />
    </div>
  );
}
