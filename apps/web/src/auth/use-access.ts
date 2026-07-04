import { useMemo } from 'react';
import {
  AccessLevel,
  AppSection,
  hasAccessLevel,
  type SectionAccess,
} from '@dpd/shared';
import { useAuth } from './auth-context';

export function useAccess() {
  const { user, isAdmin } = useAuth();

  const access = useMemo(() => user?.access ?? [], [user?.access]);

  const canAccess = (section: AppSection, level: AccessLevel, namespace?: string) => {
    if (isAdmin) {
      return true;
    }

    return access.some((grant) => {
      if (grant.section !== section) {
        return false;
      }

      if (!grant.level || !hasAccessLevel(grant.level, level)) {
        return false;
      }

      if (grant.namespace && grant.namespace !== namespace) {
        return false;
      }

      return true;
    });
  };

  return { access, canAccess, isAdmin };
}

export function useSectionAccess(section: AppSection, namespace?: string) {
  const { canAccess, isAdmin } = useAccess();

  return {
    canView: canAccess(section, AccessLevel.VIEW, namespace),
    canOperate: canAccess(section, AccessLevel.OPERATE, namespace),
    canManage: canAccess(section, AccessLevel.MANAGE, namespace),
    isAdmin,
  };
}

export function mergeSectionAccess(permissions: SectionAccess[]): Map<AppSection, AccessLevel> {
  const merged = new Map<AppSection, AccessLevel>();

  for (const grant of permissions) {
    const current = merged.get(grant.section);
    if (!current || hasAccessLevel(grant.level, current)) {
      merged.set(grant.section, grant.level);
    }
  }

  return merged;
}

export function buildAccessPayload(
  levels: Partial<Record<AppSection, AccessLevel | ''>>,
): Array<{ section: AppSection; level: AccessLevel; namespace?: string }> {
  return Object.entries(levels)
    .filter((entry): entry is [AppSection, AccessLevel] => {
      const level = entry[1];
      return level === AccessLevel.VIEW || level === AccessLevel.OPERATE || level === AccessLevel.MANAGE;
    })
    .map(([section, level]) => ({ section, level }));
}
