import type {
  CreateServiceRequest,
  EndpointSummary,
  ServiceAccessResult,
  ServiceSummary,
  ServiceTunnelSummary,
  StartServiceTunnelRequest,
  UpdateServiceRequest,
} from '@dpd/shared';
import { request } from './http';

export function getServices(namespace: string) {
  return request<ServiceSummary[]>(`/network/services?namespace=${encodeURIComponent(namespace)}`);
}

export function getServicesForDeployment(namespace: string, deployment: string) {
  return request<ServiceSummary[]>(
    `/network/services/by-deployment?namespace=${encodeURIComponent(namespace)}&deployment=${encodeURIComponent(deployment)}`,
  );
}

export function createService(payload: CreateServiceRequest) {
  return request<ServiceSummary>('/network/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateService(payload: UpdateServiceRequest) {
  return request<ServiceSummary>(
    `/network/services/${encodeURIComponent(payload.name)}?namespace=${encodeURIComponent(payload.namespace)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ type: payload.type, ports: payload.ports }),
    },
  );
}

export function deleteService(namespace: string, name: string) {
  return request<{ ok: true }>(`/network/services/${encodeURIComponent(name)}?namespace=${encodeURIComponent(namespace)}`, {
    method: 'DELETE',
  });
}

export function getEndpoints(namespace: string) {
  return request<EndpointSummary[]>(`/network/endpoints?namespace=${encodeURIComponent(namespace)}`);
}

export function startServiceTunnel(payload: StartServiceTunnelRequest) {
  return request<ServiceTunnelSummary>('/network/tunnels', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function ensureServiceAccess(payload: StartServiceTunnelRequest) {
  return request<ServiceAccessResult>('/network/services/access', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function prepareServiceAccess(payload: StartServiceTunnelRequest) {
  return request<ServiceAccessResult>('/network/services/access/prepare', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function stopServiceTunnel(id: string) {
  return request<{ ok: true }>(`/network/tunnels/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function listServiceTunnels() {
  return request<ServiceTunnelSummary[]>('/network/tunnels');
}
