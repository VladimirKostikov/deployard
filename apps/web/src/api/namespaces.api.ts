import type { NamespaceSummary } from '@dpd/shared';
import { request } from './http';

export function getNamespaces() {
  return request<NamespaceSummary[]>('/namespaces');
}

export function createNamespace(name: string) {
  return request<NamespaceSummary>('/namespaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteNamespace(name: string) {
  return request<{ ok: true }>(`/namespaces/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
}
