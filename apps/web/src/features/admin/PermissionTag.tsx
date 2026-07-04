import type { AccessLevel, AppSection } from '@dpd/shared';
import { useTranslation } from 'react-i18next';

interface PermissionTagProps {
  section: AppSection;
  level: AccessLevel;
  namespace?: string | null;
}

export function PermissionTag({ section, level, namespace }: PermissionTagProps) {
  const { t } = useTranslation('admin');

  return (
    <span className="inline-flex max-w-full items-baseline gap-1 bg-canvas px-2 py-0.5 text-xs leading-relaxed">
      <span className="font-medium text-primary">{t(`access.sections.${section}`)}</span>
      <span className="text-secondary">· {t(`access.levels.${level}`)}</span>
      {namespace ? <span className="truncate text-secondary">· {namespace}</span> : null}
    </span>
  );
}
