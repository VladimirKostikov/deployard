import type { ContainerEnvVar } from '@dpd/shared';
import { AppSection } from '@dpd/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { useDeploymentConfig } from '../../hooks/kubernetes/useDeploymentConfig';
import { EnvVarEditor } from './EnvVarEditor';

interface DeploymentConfigTabProps {
  namespace: string;
  name: string;
}

export function DeploymentConfigTab({ namespace, name }: DeploymentConfigTabProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useDeploymentConfig(namespace, name);
  const [env, setEnv] = useState<ContainerEnvVar[]>([]);

  useEffect(() => {
    if (data) {
      setEnv(data.env);
    }
  }, [data]);

  const saveMutation = useAppMutation({
    mutationFn: () =>
      api.updateDeploymentConfig(namespace, name, {
        env: env.filter((row) => row.name.trim()),
      }),
    successMessage: t('toast:deployment.configSaved'),
    errorMessage: t('toast:deployment.configError'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deployments', namespace, name, 'config'] });
      void queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
      void queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('config.loading')}</p>;
  }

  if (isError || !data) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('config.error')}
      </Card>
    );
  }

  return (
    <div className="space-y-4 border border-border bg-canvas p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{t('config.title')}</h3>
        <p className="text-xs text-secondary">
          {t('config.portHint', { port: data.containerPort })}
        </p>
      </div>

      <EnvVarEditor value={env} onChange={setEnv} disabled={saveMutation.isPending || !canOperate} />

      {canOperate ? (
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('config.submitting') : t('config.submit')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
