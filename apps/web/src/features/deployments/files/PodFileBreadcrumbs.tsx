import { useTranslation } from 'react-i18next';
import { splitPodPath } from './pod-file-utils';

interface PodFileBreadcrumbsProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function PodFileBreadcrumbs({ path, onNavigate }: PodFileBreadcrumbsProps) {
  const { t } = useTranslation('deployments');
  const segments = splitPodPath(path);

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-secondary" aria-label={t('files.breadcrumbs')}>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const label = segment === '/' ? t('files.root') : segment.split('/').pop() ?? segment;

        return (
          <span key={segment} className="inline-flex items-center gap-1">
            {index > 0 ? <span>/</span> : null}
            {isLast ? (
              <span className="font-medium text-primary">{label}</span>
            ) : (
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => onNavigate(segment)}
              >
                {label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
