import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppMutation } from '../../hooks/use-app-mutation';

export function NamespaceCreateForm() {
  const { t } = useTranslation(['namespaces', 'toast']);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const closeForm = () => {
    setOpen(false);
    setName('');
  };

  const createMutation = useAppMutation({
    mutationFn: (nextName: string) => api.createNamespace(nextName),
    successMessage: t('toast:namespace.createSuccess'),
    errorMessage: t('toast:namespace.createError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['namespaces'] });
      closeForm();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    createMutation.mutate(trimmed);
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {t('create.title')}
      </Button>

      <Modal open={open} title={t('create.title')} onClose={closeForm}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-secondary">{t('create.label')}</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('create.placeholder')}
              required
            />
          </label>
          <p className="text-xs text-secondary">{t('create.hint')}</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              {t('create.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? t('create.submitting') : t('create.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
