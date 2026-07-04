import { Injectable } from '@nestjs/common';
import { AccessLevel, AppSection, AuthUser, hasAccessLevel } from '@dpd/shared';

@Injectable()
export class PermissionChecker {
  isAdmin(user: AuthUser) {
    return user.roles.includes('admin');
  }

  canAccess(user: AuthUser, section: AppSection, level: AccessLevel, namespace?: string) {
    if (this.isAdmin(user)) {
      return true;
    }

    return user.access.some((grant) => {
      if (grant.section !== section || !grant.level) {
        return false;
      }

      if (!hasAccessLevel(grant.level, level)) {
        return false;
      }

      if (grant.namespace && grant.namespace !== namespace) {
        return false;
      }

      return true;
    });
  }

  filterDeployments<T extends { name: string }>(user: AuthUser, namespace: string, items: T[]) {
    if (this.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.VIEW, namespace)) {
      return items;
    }

    return [];
  }

  filterDeploymentsAcrossNamespaces<T extends { name: string; namespace: string }>(
    user: AuthUser,
    items: T[],
  ) {
    if (this.isAdmin(user)) {
      return items;
    }

    return items.filter((item) =>
      this.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.VIEW, item.namespace),
    );
  }
}
