import type { CreateIngressRequest, IngressSummary } from '@dpd/shared';
import { request } from './http';

export function getIngresses(namespace: string) {
  return request<IngressSummary[]>(`/ingress?namespace=${namespace}`);
}

export function createIngress(payload: CreateIngressRequest) {
  return request<IngressSummary>('/ingress', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteIngress(namespace: string, name: string) {
  return request<{ ok: true }>(`/ingress/${encodeURIComponent(name)}?namespace=${namespace}`, {
    method: 'DELETE',
  });
}
