import { useTranslation } from 'react-i18next';
import type { ClusterSummary } from '@dpd/shared';
import { SelectorField } from './ui/Select';

interface ClusterSelectorProps {
  clusters: ClusterSummary[];
  value: string;
  onChange: (cluster: string) => void;
}

export function ClusterSelector({ clusters, value, onChange }: ClusterSelectorProps) {
  const { t } = useTranslation('common');

  if (clusters.length <= 1) {
    return null;
  }

  return (
    <SelectorField
      label={t('cluster.label')}
      value={value}
      onChange={onChange}
      ariaLabel={t('cluster.label')}
    >
      {clusters.map((cluster) => (
        <option key={cluster.name} value={cluster.name}>
          {cluster.name}
        </option>
      ))}
    </SelectorField>
  );
}
