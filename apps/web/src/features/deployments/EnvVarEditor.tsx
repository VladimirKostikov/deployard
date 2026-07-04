import type { ContainerEnvVar } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface EnvVarEditorProps {
  value: ContainerEnvVar[];
  onChange: (next: ContainerEnvVar[]) => void;
  hint?: string;
  disabled?: boolean;
}

const emptyRow = (): ContainerEnvVar => ({ name: '', value: '' });

export function EnvVarEditor({ value, onChange, hint, disabled }: EnvVarEditorProps) {
  const { t } = useTranslation('deployments');

  const updateRow = (index: number, patch: Partial<ContainerEnvVar>) => {
    onChange(value.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  };

  const addRow = () => {
    onChange([...value, emptyRow()]);
  };

  return (
    <div className="space-y-3">
      {hint ? <p className="text-xs text-secondary">{hint}</p> : null}

      {value.length === 0 ? (
        <p className="text-sm text-secondary">{t('config.empty')}</p>
      ) : (
        <div className="space-y-2">
          {value.map((row, index) => (
            <div key={`${index}-${row.name}`} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <Input
                value={row.name}
                onChange={(event) => updateRow(index, { name: event.target.value })}
                placeholder={t('config.namePlaceholder')}
                disabled={disabled}
              />
              <Input
                value={row.value}
                onChange={(event) => updateRow(index, { value: event.target.value })}
                placeholder={t('config.valuePlaceholder')}
                disabled={disabled}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeRow(index)}
                disabled={disabled}
              >
                {t('config.remove')}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={addRow} disabled={disabled}>
        {t('config.add')}
      </Button>
    </div>
  );
}
