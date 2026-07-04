import { ChangeEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ComposeProjectSummary, ComposeUpResult } from '@dpd/shared';
import { Button } from '../../components/ui/Button';
import type { ImportSourceMode } from './import-flow';
import { ImportProjectPicker } from './ImportProjectPicker';
import { ImportSelectedProjectPanel } from './ImportSelectedProjectPanel';

interface ImportSourcePanelProps {
  mode: ImportSourceMode;
  namespace: string;
  composeYaml: string;
  selectedProject: ComposeProjectSummary | undefined;
  selectedProjectId: string;
  projects: ComposeProjectSummary[];
  projectsLoading: boolean;
  projectsEmptyMessage?: string;
  canRebuild: boolean;
  rebuildUnavailableReason: 'dockerUnavailable' | null;
  imageOverrides: Record<string, string>;
  onModeChange: (mode: ImportSourceMode) => void;
  onSelectProject: (project: ComposeProjectSummary) => void;
  onComposeYamlChange: (value: string) => void;
  onYamlLoaded: (value: string) => void;
  onRebuildSuccess: (result: ComposeUpResult) => void;
}

export function ImportSourcePanel({
  mode,
  namespace,
  composeYaml,
  selectedProject,
  selectedProjectId,
  projects,
  projectsLoading,
  projectsEmptyMessage,
  canRebuild,
  rebuildUnavailableReason,
  imageOverrides,
  onModeChange,
  onSelectProject,
  onComposeYamlChange,
  onYamlLoaded,
  onRebuildSuccess,
}: ImportSourcePanelProps) {
  const { t } = useTranslation('import');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    onYamlLoaded(text);
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SourceCard
          active={mode === 'projects'}
          title={t('flow.sourceDocker')}
          hint={t('flow.sourceDockerHint')}
          onClick={() => onModeChange('projects')}
        />
        <SourceCard
          active={mode === 'yaml'}
          title={t('flow.sourceYaml')}
          hint={t('flow.sourceYamlHint')}
          onClick={() => onModeChange('yaml')}
        />
      </div>

      {mode === 'projects' ? (
        <div className="space-y-4">
          <ImportProjectPicker
            projects={projects}
            selectedProjectId={selectedProjectId}
            isLoading={projectsLoading}
            emptyMessage={projectsEmptyMessage}
            onSelect={onSelectProject}
            onSwitchToYaml={() => onModeChange('yaml')}
          />

          {selectedProject ? (
            <ImportSelectedProjectPanel
              namespace={namespace}
              project={selectedProject}
              canRebuild={canRebuild}
              rebuildUnavailableReason={rebuildUnavailableReason}
              imageOverrides={imageOverrides}
              onRebuildSuccess={onRebuildSuccess}
            />
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".yml,.yaml,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              {t('yamlUpload')}
            </Button>
          </div>
          <textarea
            value={composeYaml}
            onChange={(event) => onComposeYamlChange(event.target.value)}
            rows={12}
            className="w-full border border-default bg-canvas px-3 py-2 font-mono text-sm text-primary"
            placeholder={t('composePlaceholder')}
          />
        </div>
      )}
    </div>
  );
}

interface SourceCardProps {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
}

function SourceCard({ active, title, hint, onClick }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border p-4 text-left transition-colors ${
        active ? 'border-black bg-black text-white' : 'border-default bg-canvas hover:border-border'
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className={`mt-1 text-sm ${active ? 'text-white/80' : 'text-secondary'}`}>{hint}</p>
    </button>
  );
}
