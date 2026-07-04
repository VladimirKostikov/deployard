export enum AppSection {
  DEPLOYMENTS = 'deployments',
  NETWORK = 'network',
  IMPORT = 'import',
  NAMESPACES = 'namespaces',
  METRICS = 'metrics',
  ADMIN = 'admin',
}

export enum AccessLevel {
  VIEW = 'view',
  OPERATE = 'operate',
  MANAGE = 'manage',
}

export interface SectionAccess {
  section: AppSection;
  level: AccessLevel;
  namespace: string | null;
}

export const APP_SECTIONS = [
  AppSection.DEPLOYMENTS,
  AppSection.NETWORK,
  AppSection.IMPORT,
  AppSection.NAMESPACES,
  AppSection.METRICS,
  AppSection.ADMIN,
] as const;

export const ACCESS_LEVELS = [
  AccessLevel.VIEW,
  AccessLevel.OPERATE,
  AccessLevel.MANAGE,
] as const;

const ACCESS_LEVEL_RANK: Record<AccessLevel, number> = {
  [AccessLevel.VIEW]: 1,
  [AccessLevel.OPERATE]: 2,
  [AccessLevel.MANAGE]: 3,
};

export function hasAccessLevel(granted: AccessLevel, required: AccessLevel): boolean {
  return ACCESS_LEVEL_RANK[granted] >= ACCESS_LEVEL_RANK[required];
}

export function buildSectionAccessKey(access: SectionAccess): string {
  return `${access.section}:${access.level}:${access.namespace ?? '*'}`;
}
