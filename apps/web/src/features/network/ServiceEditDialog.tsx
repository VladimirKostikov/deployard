import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServicePortSummary, ServiceSummary, ServiceType } from '@dpd/shared';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useAppMutation } from '../../hooks/use-app-mutation';

interface ServiceEditDialogProps {
  service: ServiceSummary;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ServiceEditDialog({ service, open, onClose, onSaved }: ServiceEditDialogProps) {
  const { t } = useTranslation(['network', 'toast']);
  const [type, setType] = useState<ServiceType>(service.type);
  const [ports, setPorts] = useState<ServicePortSummary[]>(service.ports);

  const saveMutation = useAppMutation({
    mutationFn: () =>
      api.updateService({
        namespace: service.namespace,
        name: service.name,
        type,
        ports,
      }),
    successMessage: t('toast:network.serviceUpdateSuccess'),
    errorMessage: t('toast:network.serviceUpdateError'),
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const updatePort = (index: number, patch: Partial<ServicePortSummary>) => {
    setPorts((current) =>
      current.map((port, portIndex) => (portIndex === index ? { ...port, ...patch } : port)),
    );
  };

  return (
    <Modal open={open} title={t('services.edit.title', { name: service.name })} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-primary">{t('services.edit.typeLabel')}</label>
          <Select value={type} onChange={(event) => setType(event.target.value as ServiceType)}>
            <option value="ClusterIP">ClusterIP</option>
            <option value="NodePort">NodePort</option>
          </Select>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">{t('services.edit.portsLabel')}</p>
          {ports.map((port, index) => (
            <div key={`${port.name ?? 'port'}-${index}`} className="grid gap-2 md:grid-cols-3">
              <Input
                type="number"
                value={port.port}
                onChange={(event) => updatePort(index, { port: Number(event.target.value) || 1 })}
                placeholder={t('services.edit.port')}
              />
              <Input
                type="number"
                value={port.targetPort}
                onChange={(event) => updatePort(index, { targetPort: Number(event.target.value) || 1 })}
                placeholder={t('services.edit.targetPort')}
              />
              {type === 'NodePort' && (
                <Input
                  type="number"
                  value={port.nodePort ?? ''}
                  onChange={(event) =>
                    updatePort(index, {
                      nodePort: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  placeholder={t('services.edit.nodePort')}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('services.edit.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('services.edit.saving') : t('services.edit.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
