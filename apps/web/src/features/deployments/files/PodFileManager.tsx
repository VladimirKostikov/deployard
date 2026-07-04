import type { PodFileEntry, PodSummary } from '@dpd/shared';
import { AccessLevel, AppSection } from '@dpd/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api';
import { useAccess } from '../../../auth/use-access';
import { Card } from '../../../components/ui/Card';
import { useAppMutation } from '../../../hooks/use-app-mutation';
import { PodFileBreadcrumbs } from './PodFileBreadcrumbs';
import { PodFilePodSelector } from './PodFilePodSelector';
import { PodFilePreviewModal } from './PodFilePreviewModal';
import { PodFileTable } from './PodFileTable';
import { PodFileToolbar } from './PodFileToolbar';
import { downloadPodFile, parentPodPath } from './pod-file-utils';

interface PodFileManagerProps {
  namespace: string;
  deploymentName: string;
  pods: PodSummary[];
  selectedPod: string;
  onPodChange: (podName: string) => void;
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index++) {
    binary += String.fromCharCode(bytes[index]!);
  }
  return btoa(binary);
}

export function PodFileManager({
  namespace,
  deploymentName,
  pods,
  selectedPod,
  onPodChange,
}: PodFileManagerProps) {
  const { t } = useTranslation(['deployments', 'toast']);
  const { canAccess } = useAccess();
  const queryClient = useQueryClient();
  const [currentPath, setCurrentPath] = useState('/');
  const [preview, setPreview] = useState<{ path: string; content: string } | null>(null);
  const activePod = selectedPod || pods[0]?.name || '';
  const canOperate = canAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE, namespace);

  const listQuery = useQuery({
    queryKey: ['pod-files', namespace, deploymentName, activePod, currentPath],
    queryFn: () =>
      api.listPodFiles(activePod, {
        namespace,
        deployment: deploymentName,
        path: currentPath,
      }),
    enabled: Boolean(activePod),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['pod-files', namespace, deploymentName, activePod],
    });
  };

  const createFolderMutation = useAppMutation({
    mutationFn: async (name: string) => {
      const path = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      return api.createPodDirectory(activePod, {
        namespace,
        deployment: deploymentName,
        path,
      });
    },
    successMessage: t('toast:deployment.filesFolderCreated'),
    errorMessage: t('toast:deployment.filesError'),
    onSuccess: invalidate,
  });

  const uploadMutation = useAppMutation({
    mutationFn: async (file: File) => {
      const path = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      return api.writePodFile(activePod, {
        namespace,
        deployment: deploymentName,
        path,
        contentBase64: await fileToBase64(file),
      });
    },
    successMessage: t('toast:deployment.filesUploaded'),
    errorMessage: t('toast:deployment.filesError'),
    onSuccess: invalidate,
  });

  const deleteMutation = useAppMutation({
    mutationFn: (entry: PodFileEntry) =>
      api.deletePodPath(activePod, {
        namespace,
        deployment: deploymentName,
        path: entry.path,
      }),
    successMessage: t('toast:deployment.filesDeleted'),
    errorMessage: t('toast:deployment.filesError'),
    onSuccess: invalidate,
  });

  const renameMutation = useAppMutation({
    mutationFn: (payload: { fromPath: string; toPath: string }) =>
      api.renamePodPath(activePod, {
        namespace,
        deployment: deploymentName,
        fromPath: payload.fromPath,
        toPath: payload.toPath,
      }),
    successMessage: t('toast:deployment.filesRenamed'),
    errorMessage: t('toast:deployment.filesError'),
    onSuccess: invalidate,
  });

  const isBusy =
    createFolderMutation.isPending ||
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    renameMutation.isPending;

  const entries = useMemo(() => listQuery.data?.entries ?? [], [listQuery.data?.entries]);

  const handleCreateFolder = () => {
    const name = window.prompt(t('files.folderPrompt'));
    if (!name?.trim()) {
      return;
    }

    createFolderMutation.mutate(name.trim());
  };

  const handleOpen = async (entry: PodFileEntry) => {
    if (entry.kind === 'directory') {
      setCurrentPath(entry.path);
      return;
    }

    const result = await api.readPodFile(activePod, {
      namespace,
      deployment: deploymentName,
      path: entry.path,
    });

    if (result.encoding === 'base64') {
      await handleDownload(entry);
      return;
    }

    setPreview({ path: entry.path, content: result.content });
  };

  const handleDownload = async (entry: PodFileEntry) => {
    const url = api.buildPodFileDownloadUrl(activePod, {
      namespace,
      deployment: deploymentName,
      path: entry.path,
    });

    await downloadPodFile(url, entry.name);
  };

  const handleRename = (entry: PodFileEntry) => {
    const nextName = window.prompt(t('files.renamePrompt'), entry.name);
    if (!nextName?.trim() || nextName.trim() === entry.name) {
      return;
    }

    const parent = parentPodPath(entry.path);
    const toPath = parent === '/' ? `/${nextName.trim()}` : `${parent}/${nextName.trim()}`;

    renameMutation.mutate({ fromPath: entry.path, toPath });
  };

  const handleDelete = (entry: PodFileEntry) => {
    if (!window.confirm(t('files.deleteConfirm', { name: entry.name }))) {
      return;
    }

    deleteMutation.mutate(entry);
  };

  if (!activePod) {
    return <Card className="p-6 text-sm text-secondary">{t('files.noPods')}</Card>;
  }

  return (
    <div className="space-y-4">
      <PodFilePodSelector pods={pods} selectedPod={activePod} onPodChange={onPodChange} />
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PodFileBreadcrumbs path={currentPath} onNavigate={setCurrentPath} />
          <PodFileToolbar
            canOperate={canOperate}
            onRefresh={() => void listQuery.refetch()}
            onCreateFolder={handleCreateFolder}
            onUpload={(file) => uploadMutation.mutate(file)}
            isBusy={isBusy || listQuery.isFetching}
          />
        </div>

        {listQuery.isLoading ? (
          <p className="text-sm text-secondary">{t('files.loading')}</p>
        ) : listQuery.isError ? (
          <p className="text-sm text-danger">{t('files.error')}</p>
        ) : (
          <PodFileTable
            entries={entries}
            canOperate={canOperate}
            onOpen={(entry) => void handleOpen(entry)}
            onDownload={(entry) => void handleDownload(entry)}
            onRename={handleRename}
            onDelete={handleDelete}
            isBusy={isBusy}
          />
        )}
      </Card>

      <PodFilePreviewModal
        open={Boolean(preview)}
        path={preview?.path ?? ''}
        content={preview?.content ?? ''}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
