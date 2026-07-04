import { useTranslation } from 'react-i18next';
import { ALL_NAMESPACES } from '@dpd/shared';
import { useNamespaces } from '../hooks/kubernetes';
import { SelectorField } from './ui/Select';

interface NamespaceSelectorProps {
  value: string;
  onChange: (namespace: string) => void;
  includeAll?: boolean;
}

export function NamespaceSelector({ value, onChange, includeAll = false }: NamespaceSelectorProps) {
  const { t } = useTranslation('common');
  const { data, isLoading, isError } = useNamespaces();

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-apple bg-border/40" />;
  }

  if (isError || !data?.length) {
    return null;
  }

  return (
    <SelectorField
      label={t('namespace.label')}
      value={value}
      onChange={onChange}
      ariaLabel={t('namespace.label')}
    >
      {includeAll ? (
        <option value={ALL_NAMESPACES}>{t('namespace.all')}</option>
      ) : null}
      {data.map((namespace) => (
        <option key={namespace.name} value={namespace.name}>
          {namespace.name}
        </option>
      ))}
    </SelectorField>
  );
}
