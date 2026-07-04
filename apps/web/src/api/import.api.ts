import type {
  ClusterImageLoadResult,
  ComposeBuildResult,
  ComposeImportPreview,
  ComposeImportRequest,
  ComposeImportResult,
  ComposeProjectDiscoveryResult,
  ComposeUpResult,
  ImportEnvironmentStatus,
} from '@dpd/shared';
import { request } from './http';

export function getImportEnvironment() {
  return request<ImportEnvironmentStatus>('/import/environment');
}

export function discoverComposeProjects() {
  return request<ComposeProjectDiscoveryResult>('/import/projects');
}

export function buildComposeProject(payload: {
  projectId: string;
  imageOverrides?: Record<string, string>;
}) {
  return request<ComposeBuildResult>('/import/projects/build', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function upComposeProject(payload: {
  projectId: string;
  imageOverrides?: Record<string, string>;
}) {
  return request<ComposeUpResult>('/import/projects/up', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function stopComposeProject(projectId: string) {
  return request<ComposeUpResult>('/import/projects/stop', {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

export function downComposeProject(projectId: string) {
  return request<ComposeUpResult>('/import/projects/down', {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

export function loadImagesToCluster(payload: {
  images: string[];
  projectId?: string;
  projectName?: string;
  imageOverrides?: Record<string, string>;
}) {
  return request<ClusterImageLoadResult>('/import/images/load-cluster', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function previewProjectImport(payload: {
  namespace: string;
  projectId: string;
  imageOverrides?: Record<string, string>;
  exposeHostPorts?: boolean;
}) {
  return request<ComposeImportPreview>('/import/projects/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function applyProjectImport(payload: {
  namespace: string;
  projectId: string;
  imageOverrides?: Record<string, string>;
  exposeHostPorts?: boolean;
  skipImagePrepare?: boolean;
}) {
  return request<ComposeImportResult>('/import/projects/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function previewComposeImport(payload: ComposeImportRequest) {
  return request<ComposeImportPreview>('/import/compose/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function applyComposeImport(payload: ComposeImportRequest) {
  return request<ComposeImportResult>('/import/compose/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
