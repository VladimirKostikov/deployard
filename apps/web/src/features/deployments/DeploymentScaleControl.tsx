import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAppMutation } from '../../hooks/use-app-mutation';
import type { DeploymentSummary } from '@dpd/shared';

interface DeploymentScaleControlProps {
  namespace: string;
  name: string;
  deployment: DeploymentSummary;
}

export function DeploymentScaleControl({ namespace, name, deployment }: DeploymentScaleControlProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const [replicas, setReplicas] = useState(String(deployment.replicas));

  useEffect(() => {
    setReplicas(String(deployment.replicas));
  }, [deployment.replicas]);

  const scaleMutation = useAppMutation({
    mutationFn: (nextReplicas: number) => api.scaleDeployment(namespace, name, nextReplicas),
    successMessage: t('toast:deployment.scaleSuccess'),
    errorMessage: t('toast:deployment.scaleError'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
      void queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      void queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
    },
  });

  const handleScale = () => {
    const next = Number(replicas);
    if (Number.isNaN(next) || next < 0) {
      return;
    }
    scaleMutation.mutate(next);
  };

  if (!canOperate) {
    return (
      <div className="border border-border bg-canvas p-4 text-sm text-secondary">
        {t('scale.label')}: {deployment.replicas}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border border-border bg-canvas p-4">
      <div className="min-w-[8rem] flex-1 space-y-1">
        <label className="text-xs font-medium text-secondary">{t('scale.label')}</label>
        <Input
          type="number"
          min={0}
          value={replicas}
          onChange={(event) => setReplicas(event.target.value)}
        />
      </div>
      <Button variant="primary" onClick={handleScale} disabled={scaleMutation.isPending}>
        {scaleMutation.isPending ? t('scale.submitting') : t('scale.submit')}
      </Button>
      <p className="w-full text-xs text-secondary">{t('scale.hint')}</p>
    </div>
  );
}
