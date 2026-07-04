import type { PodSummary } from '@dpd/shared';
import { getApiBaseUrl, request } from './http';

export function getPods(namespace: string, deployment: string) {
  const params = new URLSearchParams({ namespace, deployment });
  return request<PodSummary[]>(`/pods?${params.toString()}`);
}

export function buildPodLogsUrl(namespace: string, deployment: string, podName: string, container?: string) {
  const params = new URLSearchParams({ namespace, deployment });
  if (container) {
    params.set('container', container);
  }
  return `${getApiBaseUrl()}/pods/${podName}/logs?${params.toString()}`;
}

export function deletePod(namespace: string, deployment: string, name: string) {
  const params = new URLSearchParams({ namespace, deployment });
  return request<{ ok: boolean }>(`/pods/${name}?${params.toString()}`, { method: 'DELETE' });
}

export function restartPod(namespace: string, deployment: string, name: string) {
  const params = new URLSearchParams({ namespace, deployment });
  return request<{ ok: boolean }>(`/pods/${name}/restart?${params.toString()}`, { method: 'POST' });
}
