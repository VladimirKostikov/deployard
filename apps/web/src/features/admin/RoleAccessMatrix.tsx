import type { AccessLevel, AppSection } from '@dpd/shared';
import { APP_SECTIONS } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Select } from '../../components/ui/Select';

interface RoleAccessMatrixProps {
  value: Partial<Record<AppSection, AccessLevel | ''>>;
  onChange: (value: Partial<Record<AppSection, AccessLevel | ''>>) => void;
}

export function RoleAccessMatrix({ value, onChange }: RoleAccessMatrixProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_9rem] gap-3 px-1 text-xs font-medium text-secondary">
        <span>{t('access.section')}</span>
        <span>{t('access.level')}</span>
      </div>
      <div className="overflow-hidden rounded-apple border border-border">
        {APP_SECTIONS.map((section) => (
          <label
            key={section}
            className="grid grid-cols-[1fr_9rem] items-center gap-3 border-b border-border/60 px-3 py-2.5 last:border-b-0"
          >
            <span className="text-sm text-primary">{t(`access.sections.${section}`)}</span>
            <Select
              value={value[section] ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  [section]: event.target.value as AccessLevel | '',
                })
              }
              className="w-full"
            >
              <option value="">{t('access.levels.none')}</option>
              <option value="view">{t('access.levels.view')}</option>
              <option value="operate">{t('access.levels.operate')}</option>
              <option value="manage">{t('access.levels.manage')}</option>
            </Select>
          </label>
        ))}
      </div>
    </div>
  );
}
