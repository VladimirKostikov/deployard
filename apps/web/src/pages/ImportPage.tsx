import { useTranslation } from 'react-i18next';
import { NamespaceSelector } from '../components/NamespaceSelector';
import { ImportWorkspace } from '../features/import/ImportWorkspace';

interface ImportPageProps {
  namespace: string;
  onNamespaceChange: (namespace: string) => void;
}

export function ImportPage({ namespace, onNamespaceChange }: ImportPageProps) {
  const { t } = useTranslation('import');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('pageTitle')}</h1>
          <p className="max-w-2xl text-sm text-secondary">{t('help')}</p>
          <ol className="max-w-2xl list-decimal space-y-1 pl-5 text-sm text-secondary">
            <li>{t('flow.helpStep1')}</li>
            <li>{t('flow.helpStep2')}</li>
            <li>{t('flow.helpStep3')}</li>
          </ol>
        </div>
        <NamespaceSelector value={namespace} onChange={onNamespaceChange} />
      </div>

      <ImportWorkspace namespace={namespace} />
    </div>
  );
}
