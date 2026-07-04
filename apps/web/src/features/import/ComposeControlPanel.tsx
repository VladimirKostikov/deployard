import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { useAppMutation } from '../../hooks/use-app-mutation';

interface ComposeControlPanelProps {
  projectId: string;
  variant?: 'primary' | 'secondary';
}

export function ComposeControlPanel({ projectId, variant = 'secondary' }: ComposeControlPanelProps) {
  const { t } = useTranslation('import');

  const stopMutation = useAppMutation({
    mutationFn: () => api.stopComposeProject(projectId),
    successMessage: t('composeControl.stopSuccess'),
    errorMessage: t('composeControl.stopError'),
  });

  const downMutation = useAppMutation({
    mutationFn: () => api.downComposeProject(projectId),
    successMessage: t('composeControl.downSuccess'),
    errorMessage: t('composeControl.downError'),
  });

  return (
    <div className="space-y-3 border border-border p-4">
      <div>
        <p className="text-sm font-medium text-primary">{t('composeControl.title')}</p>
        <p className="mt-1 text-xs text-secondary">{t('composeControl.hint')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={variant}
          size="sm"
          disabled={stopMutation.isPending || downMutation.isPending}
          onClick={() => stopMutation.mutate()}
        >
          {stopMutation.isPending ? t('composeControl.stopping') : t('composeControl.stop')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={stopMutation.isPending || downMutation.isPending}
          onClick={() => downMutation.mutate()}
        >
          {downMutation.isPending ? t('composeControl.stopping') : t('composeControl.down')}
        </Button>
      </div>
    </div>
  );
}
