import type { ComposeUpResult } from '@dpd/shared';
import type { TFunction } from 'i18next';
import type { useToast } from '../../components/ui/toast/use-toast';

export function notifyComposeRebuildClusterSync(
  result: ComposeUpResult,
  toast: ReturnType<typeof useToast>,
  t: TFunction,
) {
  const sync = result.clusterSync;
  if (!sync) {
    return;
  }

  if (sync.imagesLoaded.length > 0) {
    toast.success(t('import:flow.rebuildClusterLoaded', { count: sync.imagesLoaded.length }));
  }

  if (sync.deploymentsUpdated.length > 0) {
    toast.success(t('import:flow.rebuildClusterUpdated', { count: sync.deploymentsUpdated.length }));
  }

  if (sync.deploymentsRestarted.length > 0) {
    toast.success(t('import:flow.rebuildClusterRestarted', { count: sync.deploymentsRestarted.length }));
  }

  const manifest = sync.manifest;
  if (manifest) {
    if (manifest.resourcesCreated > 0) {
      toast.success(t('import:flow.rebuildManifestCreated', { count: manifest.resourcesCreated }));
    }

    if (manifest.resourcesUpdated > 0) {
      toast.success(t('import:flow.rebuildManifestUpdated', { count: manifest.resourcesUpdated }));
    }

    if (manifest.resourcesRemoved.length > 0) {
      toast.success(t('import:flow.rebuildManifestRemoved', { count: manifest.resourcesRemoved.length }));
    }
  }

  if (sync.imagesFailed.length > 0) {
    toast.error(sync.imagesFailed.map((entry) => `${entry.image}: ${entry.error}`).join('\n'));
  }
}
