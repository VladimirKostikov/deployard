import type { PodFileContentResult, PodFileListResult } from '@dpd/shared';
import { withClusterQuery } from './cluster-context';
import { getApiBaseUrl, request } from './http';

interface PodFileQuery {
  namespace: string;
  deployment: string;
  path?: string;
  container?: string;
}

function buildParams(query: PodFileQuery) {
  const params = new URLSearchParams({
    namespace: query.namespace,
    deployment: query.deployment,
  });

  if (query.path) {
    params.set('path', query.path);
  }

  if (query.container) {
    params.set('container', query.container);
  }

  return params;
}

export function listPodFiles(podName: string, query: PodFileQuery) {
  return request<PodFileListResult>(`/pods/${podName}/files?${buildParams(query).toString()}`);
}

export function readPodFile(podName: string, query: PodFileQuery & { path: string }) {
  const params = buildParams(query);
  params.set('path', query.path);
  return request<PodFileContentResult>(`/pods/${podName}/files/content?${params.toString()}`);
}

export function buildPodFileDownloadUrl(
  podName: string,
  query: PodFileQuery & { path: string },
) {
  const params = buildParams(query);
  params.set('path', query.path);
  return withClusterQuery(`${getApiBaseUrl()}/pods/${podName}/files/download?${params.toString()}`);
}

export function writePodFile(
  podName: string,
  payload: PodFileQuery & { path: string; contentBase64: string },
) {
  return request<{ ok: true }>(`/pods/${podName}/files/content`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createPodDirectory(
  podName: string,
  payload: PodFileQuery & { path: string },
) {
  return request<{ ok: true }>(`/pods/${podName}/files/directories`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deletePodPath(podName: string, query: PodFileQuery & { path: string }) {
  const params = buildParams(query);
  params.set('path', query.path);
  return request<{ ok: true }>(`/pods/${podName}/files?${params.toString()}`, {
    method: 'DELETE',
  });
}

export function renamePodPath(
  podName: string,
  payload: PodFileQuery & { fromPath: string; toPath: string },
) {
  return request<{ ok: true }>(`/pods/${podName}/files/rename`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
