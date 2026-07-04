import type { ContainerEnvVar } from '@dpd/shared';
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDeployments } from '../../hooks/kubernetes/useDeployments';
import { useImageDefaults } from '../../hooks/kubernetes/useImageDefaults';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { Modal } from '../../components/ui/Modal';
import { ContainerImageInput } from './ContainerImageInput';
import { EnvVarEditor } from './EnvVarEditor';
import {
  DeploymentProjectField,
  resolvePartOf,
  type ProjectGroupChoice,
} from './DeploymentProjectField';
import { listProjectGroupNames } from './deployment-project-groups';

interface DeploymentCreateFormProps {
  namespace: string;
}

const defaultForm = () => ({
  name: '',
  image: '',
  replicas: '1',
  containerPort: '80',
});

export function DeploymentCreateForm({ namespace }: DeploymentCreateFormProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const queryClient = useQueryClient();
  const { data: deployments = [] } = useDeployments(namespace);
  const existingGroups = useMemo(() => listProjectGroupNames(deployments), [deployments]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultForm().name);
  const [image, setImage] = useState(defaultForm().image);
  const [replicas, setReplicas] = useState(defaultForm().replicas);
  const [containerPort, setContainerPort] = useState(defaultForm().containerPort);
  const [env, setEnv] = useState<ContainerEnvVar[]>([]);
  const [projectChoice, setProjectChoice] = useState<ProjectGroupChoice>('none');
  const [existingGroup, setExistingGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');

  const trimmedImage = image.trim();
  const parsedPort = Number(containerPort) || undefined;
  const { data: imageDefaults } = useImageDefaults(trimmedImage, parsedPort);

  useEffect(() => {
    if (!trimmedImage || !imageDefaults) {
      return;
    }

    setEnv(imageDefaults.env);
  }, [trimmedImage, imageDefaults]);

  useEffect(() => {
    if (existingGroups.length === 0) {
      if (projectChoice === 'existing') {
        setProjectChoice('none');
      }
      return;
    }

    if (!existingGroup || !existingGroups.includes(existingGroup)) {
      setExistingGroup(existingGroups[0]);
    }
  }, [existingGroups, existingGroup, projectChoice]);

  const resetForm = () => {
    const defaults = defaultForm();
    setName(defaults.name);
    setImage(defaults.image);
    setReplicas(defaults.replicas);
    setContainerPort(defaults.containerPort);
    setEnv([]);
    setProjectChoice('none');
    setExistingGroup(existingGroups[0] ?? '');
    setNewGroup('');
  };

  const closeForm = () => {
    setOpen(false);
    resetForm();
  };

  const createMutation = useAppMutation({
    mutationFn: () =>
      api.createDeployment({
        name: name.trim(),
        namespace,
        image: trimmedImage,
        replicas: Number(replicas) || 1,
        containerPort: Number(containerPort) || 80,
        env: env.filter((row) => row.name.trim()),
        partOf: resolvePartOf(projectChoice, existingGroup, newGroup),
      }),
    successMessage: t('toast:deployment.createSuccess'),
    errorMessage: t('toast:deployment.createError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      closeForm();
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !trimmedImage) {
      return;
    }

    createMutation.mutate();
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {t('create.submit')}
      </Button>

      <Modal open={open} title={t('create.title')} onClose={closeForm} panelClassName="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('create.namePlaceholder')} />
            <div className="md:col-span-2">
              <ContainerImageInput
                value={image}
                onChange={setImage}
                onOptionSelect={(option) => {
                  if (option.defaultPort) {
                    setContainerPort(String(option.defaultPort));
                  }
                }}
                placeholder={t('create.imagePlaceholder')}
              />
            </div>
            <Input type="number" min={0} value={replicas} onChange={(e) => setReplicas(e.target.value)} placeholder={t('create.replicasPlaceholder')} />
            <Input type="number" min={1} value={containerPort} onChange={(e) => setContainerPort(e.target.value)} placeholder={t('create.portPlaceholder')} />
          </div>

          <DeploymentProjectField
            existingGroups={existingGroups}
            choice={projectChoice}
            existingGroup={existingGroup}
            newGroup={newGroup}
            onChoiceChange={setProjectChoice}
            onExistingGroupChange={(value) => setExistingGroup(value)}
            onNewGroupChange={setNewGroup}
          />

          {trimmedImage ? (
            <div className="space-y-2 border border-border bg-canvas p-4">
              <h3 className="text-sm font-medium">{t('config.title')}</h3>
              <EnvVarEditor
                value={env}
                onChange={setEnv}
                hint={imageDefaults?.hint ?? t('config.createHint')}
                disabled={createMutation.isPending}
              />
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeForm}>
              {t('create.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending || !name.trim() || !trimmedImage}>
              {createMutation.isPending ? t('create.submitting') : t('create.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
