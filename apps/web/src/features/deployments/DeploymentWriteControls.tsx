import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSection } from '@dpd/shared';
import { api } from '../../api';
import { useSectionAccess } from '../../auth/use-access';
import { Button } from '../../components/ui/Button';
import { useAppMutation } from '../../hooks/use-app-mutation';
import { ContainerImageInput } from './ContainerImageInput';

interface DeploymentImageControlProps {
  namespace: string;
  name: string;
  image: string;
}

export function DeploymentImageControl({ namespace, name, image }: DeploymentImageControlProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const queryClient = useQueryClient();
  const [nextImage, setNextImage] = useState(image);

  useEffect(() => {
    setNextImage(image);
  }, [image]);

  const updateMutation = useAppMutation({
    mutationFn: () => api.updateDeploymentImage(namespace, name, nextImage.trim()),
    successMessage: t('toast:deployment.imageSuccess'),
    errorMessage: t('toast:deployment.imageError'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name] });
      await queryClient.invalidateQueries({ queryKey: ['deployments', namespace] });
      await queryClient.invalidateQueries({ queryKey: ['deployment', namespace, name, 'history'] });
      await queryClient.invalidateQueries({ queryKey: ['pods', namespace, name] });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!nextImage.trim() || nextImage.trim() === image.trim()) {
      return;
    }

    updateMutation.mutate();
  };

  const unchanged = nextImage.trim() === image.trim();

  if (!canOperate) {
    return (
      <div className="space-y-2 border border-border bg-canvas p-4">
        <p className="text-xs font-medium text-secondary">{t('image.label')}</p>
        <p className="font-mono text-sm text-primary">{image}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border bg-canvas p-4">
      <div className="min-w-[16rem] space-y-1">
        <label className="text-xs font-medium text-secondary">{t('image.label')}</label>
        <ContainerImageInput value={nextImage} onChange={setNextImage} placeholder={image} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={updateMutation.isPending || !nextImage.trim() || unchanged}
        >
          {updateMutation.isPending ? t('image.submitting') : t('image.submit')}
        </Button>
        {unchanged && nextImage.trim() && (
          <p className="text-xs text-secondary">{t('image.unchanged')}</p>
        )}
      </div>
      {updateMutation.isError && (
        <p className="text-sm text-danger">{t('image.error')}</p>
      )}
    </form>
  );
}
