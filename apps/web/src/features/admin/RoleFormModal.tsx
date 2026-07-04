import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccessLevel, AppSection } from '@dpd/shared';
import { APP_SECTIONS } from '@dpd/shared';
import type { AdminRole } from '../../api/admin.api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { buildAccessPayload, mergeSectionAccess } from '../../auth/use-access';
import { RoleAccessMatrix } from './RoleAccessMatrix';

interface RoleFormModalProps {
  open: boolean;
  role: AdminRole | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    access: Array<{ section: AppSection; level: AccessLevel }>;
  }) => void;
}

const emptyLevels = (): Partial<Record<AppSection, AccessLevel | ''>> =>
  Object.fromEntries(APP_SECTIONS.map((section) => [section, ''])) as Partial<
    Record<AppSection, AccessLevel | ''>
  >;

export function RoleFormModal({ open, role, isPending, onClose, onSubmit }: RoleFormModalProps) {
  const { t } = useTranslation('admin');
  const [name, setName] = useState('');
  const [levels, setLevels] = useState(emptyLevels());

  useEffect(() => {
    if (!open) {
      return;
    }

    if (role) {
      const merged = mergeSectionAccess(
        role.permissions.map((permission) => ({
          section: permission.section,
          level: permission.level,
          namespace: permission.namespace,
        })),
      );
      setName(role.name);
      setLevels(
        Object.fromEntries(
          APP_SECTIONS.map((section) => [section, merged.get(section) ?? '']),
        ) as Partial<Record<AppSection, AccessLevel | ''>>,
      );
      return;
    }

    setName('');
    setLevels(emptyLevels());
  }, [open, role]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      access: buildAccessPayload(levels),
    });
  };

  return (
    <Modal
      open={open}
      title={role ? t('roles.editTitle') : t('roles.createTitle')}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-secondary">{t('roles.name')}</span>
          <Input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <RoleAccessMatrix value={levels} onChange={setLevels} />

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
