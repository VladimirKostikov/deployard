import type { Dispatch, SetStateAction } from 'react';
import type { ComposeImportPreview, ComposeProjectSummary } from '@dpd/shared';
import type { ImportSourceMode } from './import-flow';
import type { ImportApplyProgress } from './import-apply-progress';

export interface ImportWorkspaceMutationInput {
  namespace: string;
  mode: ImportSourceMode;
  composeYaml: string;
  selectedProjectId: string;
  selectedProject: ComposeProjectSummary | undefined;
  projects: ComposeProjectSummary[];
  imageOverrides: Record<string, string>;
  exposeHostPorts: boolean;
  preview: ComposeImportPreview | null;
  overrideServices: Array<{ name: string; hasBuild: boolean }>;
  imagesToLoad: string[];
  dockerAvailable: boolean | undefined;
  kindAvailable: boolean | undefined;
  setPreview: (preview: ComposeImportPreview | null) => void;
  setImageOverrides: Dispatch<SetStateAction<Record<string, string>>>;
  setApplyProgress: Dispatch<SetStateAction<ImportApplyProgress | null>>;
  resetPreview: () => void;
}
