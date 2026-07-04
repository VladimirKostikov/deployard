import { withClusterQuery } from './cluster-context';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${withClusterQuery(path)}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 401) {
    throw { code: 'UNAUTHORIZED', status: 401 };
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw errorBody ?? new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl() {
  return baseUrl;
}
