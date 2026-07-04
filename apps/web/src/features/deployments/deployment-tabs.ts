export type DeploymentTab =
  | 'overview'
  | 'health'
  | 'config'
  | 'history'
  | 'pods'
  | 'files'
  | 'logs'
  | 'console';

export const DEPLOYMENT_TABS: DeploymentTab[] = [
  'overview',
  'health',
  'config',
  'history',
  'pods',
  'files',
  'logs',
  'console',
];

export function parseDeploymentTab(value: string | null): DeploymentTab {
  if (value && DEPLOYMENT_TABS.includes(value as DeploymentTab)) {
    return value as DeploymentTab;
  }

  return 'overview';
}
