import { describe, expect, it } from 'vitest';
import { AccessLevel, AppSection } from '@dpd/shared';
import type { AuthUser } from '@dpd/shared';
import { PermissionChecker } from './permission-checker.service';

function buildUser(access: AuthUser['access']): AuthUser {
  return {
    id: 'user-1',
    email: 'user@dpd.local',
    displayName: 'Demo User',
    roles: ['user'],
    access,
  };
}

describe('PermissionChecker', () => {
  const checker = new PermissionChecker();

  it('allows global section access in any namespace', () => {
    const user = buildUser([
      { section: AppSection.DEPLOYMENTS, level: AccessLevel.VIEW, namespace: null },
    ]);

    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.VIEW, 'demo')).toBe(true);
  });

  it('denies when namespace scope mismatches', () => {
    const user = buildUser([
      { section: AppSection.DEPLOYMENTS, level: AccessLevel.OPERATE, namespace: 'default' },
    ]);

    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.OPERATE, 'demo')).toBe(
      false,
    );
  });

  it('denies operate when only view is granted', () => {
    const user = buildUser([
      { section: AppSection.DEPLOYMENTS, level: AccessLevel.VIEW, namespace: null },
    ]);

    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.VIEW, 'demo')).toBe(true);
    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.OPERATE, 'demo')).toBe(
      false,
    );
    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.MANAGE, 'demo')).toBe(false);
  });

  it('ignores grants without level', () => {
    const user = buildUser([
      { section: AppSection.DEPLOYMENTS, level: null as unknown as AccessLevel, namespace: null },
    ]);

    expect(checker.canAccess(user, AppSection.DEPLOYMENTS, AccessLevel.VIEW, 'demo')).toBe(false);
  });
});
