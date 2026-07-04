import type { AccessLevel, AppSection } from '@dpd/shared';
import { request } from './http';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  roles: Array<{ id: string; name: string }>;
  createdAt: string;
}

export interface AdminPermission {
  id: string;
  section: AppSection;
  level: AccessLevel;
  namespace: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermission[];
}

export function getAdminUsers() {
  return request<AdminUser[]>('/admin/users');
}

export function createAdminUser(payload: {
  email: string;
  password: string;
  displayName: string;
  roleIds: string[];
}) {
  return request<AdminUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminUser(
  id: string,
  payload: {
    displayName?: string;
    isActive?: boolean;
    password?: string;
    roleIds?: string[];
  },
) {
  return request<AdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminUser(id: string) {
  return request<{ ok: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
}

export function getAdminRoles() {
  return request<AdminRole[]>('/admin/roles');
}

export function createAdminRole(payload: {
  name: string;
  access?: Array<{ section: AppSection; level: AccessLevel; namespace?: string }>;
}) {
  return request<AdminRole>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminRole(
  id: string,
  payload: {
    name?: string;
    access?: Array<{ section: AppSection; level: AccessLevel; namespace?: string }>;
  },
) {
  return request<AdminRole>(`/admin/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminRole(id: string) {
  return request<{ ok: boolean }>(`/admin/roles/${id}`, { method: 'DELETE' });
}

export function getAdminPermissions() {
  return request<AdminPermission[]>('/admin/permissions');
}
