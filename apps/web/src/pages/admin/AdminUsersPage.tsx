import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import type { AdminUser } from '../../api/admin.api';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TableScroll } from '../../components/ui/TableScroll';
import { AdminPageHeader } from '../../features/admin/AdminPageHeader';
import { AdminRowActions } from '../../features/admin/AdminRowActions';
import { ConfirmDialog } from '../../features/admin/ConfirmDialog';
import { UserFormModal } from '../../features/admin/UserFormModal';
import { useAppMutation } from '../../hooks/use-app-mutation';

export function AdminUsersPage() {
  const { t } = useTranslation(['admin', 'toast']);
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const usersQuery = useQuery({ queryKey: ['admin', 'users'], queryFn: () => api.getAdminUsers() });
  const rolesQuery = useQuery({ queryKey: ['admin', 'roles'], queryFn: () => api.getAdminRoles() });

  const saveMutation = useAppMutation({
    mutationFn: async (payload: {
      email: string;
      displayName: string;
      password: string;
      roleIds: string[];
      isActive: boolean;
    }) => {
      if (editingUser) {
        return api.updateAdminUser(editingUser.id, {
          displayName: payload.displayName,
          isActive: payload.isActive,
          roleIds: payload.roleIds,
          password: payload.password || undefined,
        });
      }

      return api.createAdminUser({
        email: payload.email,
        displayName: payload.displayName,
        password: payload.password,
        roleIds: payload.roleIds,
      });
    },
    successMessage: t('toast:admin.userSaveSuccess'),
    errorMessage: t('toast:admin.userSaveError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setFormOpen(false);
      setEditingUser(null);
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => api.deleteAdminUser(id),
    successMessage: t('toast:admin.userDeleteSuccess'),
    errorMessage: t('toast:admin.userDeleteError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeletingUser(null);
    },
  });

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        action={
          <Button variant="primary" onClick={openCreate}>
            {t('users.create')}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <TableScroll>
          <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="px-5 py-3 font-semibold">{t('users.email')}</th>
              <th className="px-5 py-3 font-semibold">{t('users.name')}</th>
              <th className="px-5 py-3 font-semibold">{t('users.roles')}</th>
              <th className="px-5 py-3 font-semibold">{t('users.status')}</th>
              <th className="px-5 py-3 font-semibold">{t('actions.label')}</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data ?? []).map((user) => (
              <tr key={user.id} className="border-t border-border hover:bg-canvas">
                <td className="px-5 py-4 font-medium text-primary">{user.email}</td>
                <td className="px-5 py-4 text-secondary">{user.displayName}</td>
                <td className="px-5 py-4 text-secondary">
                  {user.roles.map((role) => role.name).join(', ')}
                </td>
                <td className="px-5 py-4">
                  <StatusIndicator variant={user.isActive ? 'ok' : 'off'} className="text-sm">
                    {user.isActive ? t('users.active') : t('users.inactive')}
                  </StatusIndicator>
                </td>
                <td className="px-5 py-4">
                  <AdminRowActions
                    editLabel={t('actions.edit')}
                    deleteLabel={t('actions.delete')}
                    onEdit={() => openEdit(user)}
                    onDelete={() => setDeletingUser(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TableScroll>
      </Card>

      <UserFormModal
        open={formOpen}
        user={editingUser}
        roles={rolesQuery.data ?? []}
        isPending={saveMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={Boolean(deletingUser)}
        title={t('users.deleteTitle')}
        message={t('users.deleteMessage', { email: deletingUser?.email ?? '' })}
        isPending={deleteMutation.isPending}
        onCancel={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
      />
    </div>
  );
}
