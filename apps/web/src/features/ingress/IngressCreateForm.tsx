import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppMutation } from '../../hooks/use-app-mutation';

interface IngressCreateFormProps {
  namespace: string;
}

const defaultForm = () => ({
  name: '',
  host: '',
  path: '/',
  serviceName: '',
  servicePort: '80',
});

export function IngressCreateForm({ namespace }: IngressCreateFormProps) {
  const { t } = useTranslation(['ingress', 'toast']);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultForm().name);
  const [host, setHost] = useState(defaultForm().host);
  const [path, setPath] = useState(defaultForm().path);
  const [serviceName, setServiceName] = useState(defaultForm().serviceName);
  const [servicePort, setServicePort] = useState(defaultForm().servicePort);

  const resetForm = () => {
    const defaults = defaultForm();
    setName(defaults.name);
    setHost(defaults.host);
    setPath(defaults.path);
    setServiceName(defaults.serviceName);
    setServicePort(defaults.servicePort);
  };

  const closeForm = () => {
    setOpen(false);
    resetForm();
  };

  const createMutation = useAppMutation({
    mutationFn: () =>
      api.createIngress({
        name: name.trim(),
        namespace,
        host: host.trim(),
        path: path.trim() || '/',
        serviceName: serviceName.trim(),
        servicePort: Number(servicePort) || 80,
      }),
    successMessage: t('toast:ingress.createSuccess'),
    errorMessage: t('toast:ingress.createError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ingress', namespace] });
      closeForm();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !host.trim() || !serviceName.trim()) {
      return;
    }

    createMutation.mutate();
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {t('create.title')}
      </Button>

      <Modal open={open} title={t('create.title')} onClose={closeForm}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('create.name')} required />
            <Input value={host} onChange={(e) => setHost(e.target.value)} placeholder={t('create.host')} required />
            <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder={t('create.path')} />
            <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder={t('create.service')} required />
            <Input type="number" min={1} value={servicePort} onChange={(e) => setServicePort(e.target.value)} placeholder={t('create.port')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              {t('create.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending || !name.trim() || !host.trim() || !serviceName.trim()}>
              {createMutation.isPending ? t('create.submitting') : t('create.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
