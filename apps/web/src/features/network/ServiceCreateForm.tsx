import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppMutation } from '../../hooks/use-app-mutation';

interface ServiceCreateFormProps {
  namespace: string;
  deploymentOptions: string[];
  defaultDeployment?: string;
}

const defaultForm = (deploymentName = '') => ({
  name: deploymentName,
  deploymentName,
  port: '80',
  targetPort: '',
});

export function ServiceCreateForm({ namespace, deploymentOptions, defaultDeployment }: ServiceCreateFormProps) {
  const { t } = useTranslation(['network', 'toast']);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultForm(defaultDeployment).name);
  const [deploymentName, setDeploymentName] = useState(defaultForm(defaultDeployment).deploymentName);
  const [port, setPort] = useState(defaultForm(defaultDeployment).port);
  const [targetPort, setTargetPort] = useState(defaultForm(defaultDeployment).targetPort);

  useEffect(() => {
    if (!defaultDeployment) {
      return;
    }

    const defaults = defaultForm(defaultDeployment);
    setName(defaults.name);
    setDeploymentName(defaults.deploymentName);
  }, [defaultDeployment]);

  const resetForm = () => {
    const defaults = defaultForm(defaultDeployment ?? deploymentOptions[0] ?? '');
    setName(defaults.name);
    setDeploymentName(defaults.deploymentName);
    setPort(defaults.port);
    setTargetPort(defaults.targetPort);
  };

  const closeForm = () => {
    setOpen(false);
    resetForm();
  };

  const createMutation = useAppMutation({
    mutationFn: () =>
      api.createService({
        name: name.trim(),
        namespace,
        deploymentName: deploymentName.trim(),
        port: Number(port) || 80,
        targetPort: targetPort.trim() ? Number(targetPort) : undefined,
      }),
    successMessage: t('toast:network.serviceCreateSuccess'),
    errorMessage: t('toast:network.serviceCreateError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['network', 'services', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['network', 'endpoints', namespace] });
      closeForm();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !deploymentName.trim()) {
      return;
    }

    createMutation.mutate();
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {t('services.create.submit')}
      </Button>

      <Modal open={open} title={t('services.create.title')} onClose={closeForm}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('services.create.name')} required />
            <select
              value={deploymentName}
              onChange={(e) => {
                setDeploymentName(e.target.value);
                if (!name.trim() || name === deploymentName) {
                  setName(e.target.value);
                }
              }}
              className="field-control h-10 w-full border border-border bg-elevated px-3 text-sm text-primary"
              required
            >
              <option value="" disabled>
                {t('services.create.deployment')}
              </option>
              {deploymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Input type="number" min={1} value={port} onChange={(e) => setPort(e.target.value)} placeholder={t('services.create.port')} />
            <Input type="number" min={1} value={targetPort} onChange={(e) => setTargetPort(e.target.value)} placeholder={t('services.create.targetPort')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              {t('services.create.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending || !name.trim() || !deploymentName.trim()}>
              {createMutation.isPending ? t('services.create.submitting') : t('services.create.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
