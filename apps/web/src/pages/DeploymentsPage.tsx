import { useTranslation } from 'react-i18next';
import { ALL_NAMESPACES } from '@dpd/shared';
import { NamespaceSelector } from '../components/NamespaceSelector';
import { ImportPageLink } from '../features/import/ImportPageLink';
import { DeploymentCreateForm } from '../features/deployments/DeploymentCreateForm';
import { DeploymentList } from '../features/deployments/DeploymentList';

interface DeploymentsPageProps {
  namespace: string;
  onNamespaceChange: (namespace: string) => void;
}

export function DeploymentsPage({ namespace, onNamespaceChange }: DeploymentsPageProps) {
  const { t } = useTranslation('deployments');
  const showAllNamespaces = namespace === ALL_NAMESPACES;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('title')}</h1>
          <p className="text-sm text-secondary">
            {showAllNamespaces ? t('subtitleAll') : t('subtitle')}
          </p>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[auto_auto_auto] sm:items-center">
          <ImportPageLink />
          {!showAllNamespaces ? <DeploymentCreateForm namespace={namespace} /> : null}
          <NamespaceSelector
            value={namespace}
            onChange={onNamespaceChange}
            includeAll
          />
        </div>
      </div>
      <DeploymentList namespace={namespace} />
    </div>
  );
}
