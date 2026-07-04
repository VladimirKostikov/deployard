export type PodFileKind = 'file' | 'directory';

export interface PodFileEntry {
  name: string;
  path: string;
  kind: PodFileKind;
  size: number;
  modifiedAt?: string;
  permissions?: string;
}

export interface PodFileListResult {
  path: string;
  entries: PodFileEntry[];
}

export interface PodFileContentResult {
  path: string;
  size: number;
  encoding: 'utf-8' | 'base64';
  content: string;
}

export const POD_FILE_MAX_BYTES = 1_048_576;
