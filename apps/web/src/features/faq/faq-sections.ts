export const FAQ_SECTIONS = [
  {
    id: 'basics',
    items: ['namespace', 'cluster', 'deployment', 'metrics'] as const,
  },
  {
    id: 'workloads',
    items: ['pod', 'node', 'replica', 'image', 'phase', 'restarts', 'ready'] as const,
  },
  {
    id: 'operations',
    items: [
      'revision',
      'rollback',
      'scale',
      'logs',
      'console',
      'status',
      'healthProbes',
    ] as const,
  },
  {
    id: 'import',
    items: ['composeImport', 'projectGroup', 'imageOverride', 'rebuild', 'kindLoad'] as const,
  },
  {
    id: 'network',
    items: ['service', 'portForward', 'nodePort'] as const,
  },
  {
    id: 'dev',
    items: ['dockerCompose', 'errImagePull', 'demoProjects'] as const,
  },
  {
    id: 'admin',
    items: ['users', 'roles', 'permissions'] as const,
  },
] as const;

export type FaqItemId = (typeof FAQ_SECTIONS)[number]['items'][number];
