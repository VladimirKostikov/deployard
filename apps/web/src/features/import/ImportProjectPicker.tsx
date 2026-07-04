import type { ComposeProjectSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';

interface ImportProjectPickerProps {
  projects: ComposeProjectSummary[];
  selectedProjectId: string;
  isLoading: boolean;
  emptyMessage?: string;
  onSelect: (project: ComposeProjectSummary) => void;
  onSwitchToYaml: () => void;
}

function projectSourceLabel(project: ComposeProjectSummary, t: (key: string) => string): string {
  if (project.source === 'file') {
    return t('projectGroups.file');
  }
  return t('projectGroups.docker');
}

export function ImportProjectPicker({
  projects,
  selectedProjectId,
  isLoading,
  emptyMessage,
  onSelect,
  onSwitchToYaml,
}: ImportProjectPickerProps) {
  const { t } = useTranslation('import');

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('projectsLoading')}</p>;
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-3 border border-dashed border-default bg-canvas p-5">
        <p className="text-sm text-secondary">{emptyMessage ?? t('projectsEmpty')}</p>
        <p className="text-sm text-secondary">{t('flow.emptyDockerHint')}</p>
        <Button type="button" variant="secondary" size="sm" onClick={onSwitchToYaml}>
          {t('flow.switchToYaml')}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const selected = selectedProjectId === project.id;

        return (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project)}
            className={`border p-4 text-left transition-colors ${
              selected ? 'border-black bg-black text-white' : 'border-default bg-canvas hover:border-border'
            }`}
          >
            <p className="font-medium">{project.name}</p>
            <p className={`mt-1 text-xs uppercase tracking-wide ${selected ? 'text-white/70' : 'text-secondary'}`}>
              {projectSourceLabel(project, t)}
            </p>
            <p className={`mt-1 text-sm ${selected ? 'text-white/80' : 'text-secondary'}`}>
              {t('projectStats', {
                services: project.serviceCount,
                running: project.runningCount,
              })}
            </p>
          </button>
        );
      })}
    </div>
  );
}
