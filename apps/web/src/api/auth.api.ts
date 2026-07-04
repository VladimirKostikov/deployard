import type { AuthUser, LoginRequest } from '@dpd/shared';
import { request } from './http';

export function login(payload: LoginRequest) {
  return request<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request<AuthUser>('/auth/me');
}
