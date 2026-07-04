import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { ComposeImportPreviewPanel } from './ComposeImportPreviewPanel';
import { ImportApplyPanel } from './ImportApplyPanel';
import { ImportEnvironmentBanner } from './ImportEnvironmentBanner';
import { ImportOptionsPanel } from './ImportOptionsPanel';
import { ImportSection } from './ImportSection';
import { ImportSourcePanel } from './ImportSourcePanel';
import { useImportWorkspace } from './use-import-workspace';

interface ImportWorkspaceProps {
  namespace: string;
}

export function ImportWorkspace({ namespace }: ImportWorkspaceProps) {
  const { t } = useTranslation('import');
  const workspace = useImportWorkspace(namespace);

  return (
    <div className="space-y-4">
      {workspace.environmentQuery.data && (
        <ImportEnvironmentBanner status={workspace.environmentQuery.data} />
      )}

      <ImportSection step={1} title={t('flow.stepSource')} hint={t('flow.stepSourceHint')}>
        <ImportSourcePanel
          mode={workspace.mode}
          namespace={namespace}
          composeYaml={workspace.composeYaml}
          selectedProject={workspace.selectedProject}
          selectedProjectId={workspace.selectedProjectId}
          projects={workspace.projectsQuery.data?.projects ?? []}
          projectsLoading={workspace.projectsQuery.isLoading}
          projectsEmptyMessage={workspace.projectsQuery.data?.message ?? t('projectsEmpty')}
          canRebuild={workspace.canRebuild}
          rebuildUnavailableReason={workspace.rebuildUnavailableReason}
          imageOverrides={workspace.imageOverrides}
          onModeChange={workspace.changeMode}
          onSelectProject={workspace.selectProject}
          onComposeYamlChange={(value) => {
            workspace.setComposeYaml(value);
            workspace.resetPreview();
          }}
          onYamlLoaded={(value) => {
            workspace.setComposeYaml(value);
            workspace.changeMode('yaml');
            workspace.resetPreview();
          }}
          onRebuildSuccess={workspace.handleRebuildSuccess}
        />
      </ImportSection>

      <ImportSection
        step={2}
        title={t('flow.stepOptions')}
        hint={t('flow.stepOptionsHint')}
        muted={!workspace.sourceReady}
      >
        <ImportOptionsPanel
          exposeHostPorts={workspace.exposeHostPorts}
          canLoadImages={workspace.canLoadImages}
          loadPending={workspace.loadMutation.isPending}
          overrideServices={workspace.overrideServices}
          imageOverrides={workspace.imageOverrides}
          onExposeHostPortsChange={(value) => {
            workspace.setExposeHostPorts(value);
            workspace.resetPreview();
          }}
          onImageOverrideChange={(service, value) => {
            workspace.setImageOverrides((current) => ({ ...current, [service]: value }));
            workspace.resetPreview();
          }}
          onLoadImages={() => workspace.loadMutation.mutate()}
        />
      </ImportSection>

      <ImportSection
        step={3}
        title={t('flow.stepPreview')}
        hint={t('flow.stepPreviewHint')}
        muted={!workspace.sourceReady}
      >
        {!workspace.preview ? (
          <div className="space-y-3">
            <p className="text-sm text-secondary">{t('flow.previewEmpty')}</p>
            <Button
              type="button"
              variant="secondary"
              disabled={!workspace.sourceReady || workspace.previewMutation.isPending}
              onClick={() => workspace.previewMutation.mutate()}
            >
              {workspace.previewMutation.isPending ? t('actions.previewing') : t('flow.generatePreview')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <ComposeImportPreviewPanel preview={workspace.preview} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={workspace.previewMutation.isPending}
              onClick={() => workspace.previewMutation.mutate()}
            >
              {workspace.previewMutation.isPending ? t('actions.previewing') : t('flow.refreshPreview')}
            </Button>
          </div>
        )}
      </ImportSection>

      <ImportSection
        step={4}
        title={t('flow.stepImport')}
        hint={t('flow.stepImportHint', { namespace })}
        muted={!workspace.preview}
      >
        <ImportApplyPanel
          namespace={namespace}
          ready={Boolean(workspace.preview)}
          isApplying={workspace.applyMutation.isPending}
          progress={workspace.applyProgress}
          onApply={() => workspace.applyMutation.mutate()}
        />
      </ImportSection>
    </div>
  );
}
