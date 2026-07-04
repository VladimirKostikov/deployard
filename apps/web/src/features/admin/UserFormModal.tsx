import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminRole, AdminUser } from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface UserFormModalProps {
  open: boolean;
  user: AdminUser | null;
  roles: AdminRole[];
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    email: string;
    displayName: string;
    password: string;
    roleIds: string[];
    isActive: boolean;
  }) => void;
}

const emptyForm = {
  email: '',
  displayName: '',
  password: '',
  roleIds: [] as string[],
  isActive: true,
};

export function UserFormModal({
  open,
  user,
  roles,
  isPending,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const { t } = useTranslation('admin');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (user) {
      setForm({
        email: user.email,
        displayName: user.displayName,
        password: '',
        roleIds: user.roles.map((role) => role.id),
        isActive: user.isActive,
      });
      return;
    }

    setForm(emptyForm);
  }, [open, user]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  const toggleRole = (roleId: string) => {
    setForm((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId],
    }));
  };

  return (
    <Modal
      open={open}
      title={user ? t('users.editTitle') : t('users.createTitle')}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-secondary">{t('users.email')}</span>
          <Input
            type="email"
            required
            disabled={Boolean(user)}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-secondary">{t('users.name')}</span>
          <Input
            type="text"
            required
            value={form.displayName}
            onChange={(event) =>
              setForm((current) => ({ ...current, displayName: event.target.value }))
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-secondary">
            {user ? t('users.newPassword') : t('users.password')}
          </span>
          <Input
            type="password"
            required={!user}
            minLength={8}
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
        </label>

        {user && (
          <label className="flex items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            {t('users.active')}
          </label>
        )}

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-secondary">{t('users.roles')}</legend>
          <div className="space-y-2 rounded-apple border border-border p-3">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={form.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                {role.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? t('actions.saving') : t('actions.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
