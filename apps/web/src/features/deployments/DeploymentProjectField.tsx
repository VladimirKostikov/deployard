import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export type ProjectGroupChoice = 'none' | 'existing' | 'new';

interface DeploymentProjectFieldProps {
  existingGroups: string[];
  choice: ProjectGroupChoice;
  existingGroup: string;
  newGroup: string;
  onChoiceChange: (choice: ProjectGroupChoice) => void;
  onExistingGroupChange: (value: string) => void;
  onNewGroupChange: (value: string) => void;
}

export function resolvePartOf(
  choice: ProjectGroupChoice,
  existingGroup: string,
  newGroup: string,
): string | undefined {
  if (choice === 'existing') {
    return existingGroup.trim() || undefined;
  }

  if (choice === 'new') {
    return newGroup.trim() || undefined;
  }

  return undefined;
}

export function DeploymentProjectField({
  existingGroups,
  choice,
  existingGroup,
  newGroup,
  onChoiceChange,
  onExistingGroupChange,
  onNewGroupChange,
}: DeploymentProjectFieldProps) {
  const { t } = useTranslation('deployments');

  return (
    <div className="space-y-3 border border-border bg-canvas p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">{t('create.projectLabel')}</p>
        <p className="text-xs text-secondary">{t('create.projectHint')}</p>
      </div>

      <Select
        value={choice}
        onChange={(event) => onChoiceChange(event.target.value as ProjectGroupChoice)}
      >
        <option value="none">{t('create.projectNone')}</option>
        {existingGroups.length > 0 && (
          <option value="existing">{t('create.projectExisting')}</option>
        )}
        <option value="new">{t('create.projectNew')}</option>
      </Select>

      {choice === 'existing' && existingGroups.length > 0 && (
        <Select value={existingGroup} onChange={(event) => onExistingGroupChange(event.target.value)}>
          {existingGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>
      )}

      {choice === 'new' && (
        <Input
          value={newGroup}
          onChange={(event) => onNewGroupChange(event.target.value)}
          placeholder={t('create.projectNewPlaceholder')}
        />
      )}
    </div>
  );
}
