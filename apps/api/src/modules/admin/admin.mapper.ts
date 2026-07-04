import type { AccessLevel, AppSection } from '@dpd/shared';
import type { PermissionEntity, RoleEntity, UserEntity } from '../users/entities/user.entity';

export function sanitizeAdminUser(user: UserEntity) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isActive: user.isActive,
    roles: user.roles.map((role) => ({ id: role.id, name: role.name })),
    createdAt: user.createdAt,
  };
}

export function sanitizeAdminRole(role: RoleEntity) {
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((permission) => ({
      id: permission.id,
      section: permission.section as AppSection,
      level: permission.level as AccessLevel,
      namespace: permission.namespace,
    })),
  };
}

export function sanitizeAdminPermission(permission: PermissionEntity) {
  return {
    id: permission.id,
    section: permission.section as AppSection,
    level: permission.level as AccessLevel,
    namespace: permission.namespace,
  };
}
