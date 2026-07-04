export type NetworkTab = 'services' | 'endpoints' | 'ingress';

export function parseNetworkTab(value: string | null): NetworkTab {
  if (value === 'endpoints' || value === 'ingress') {
    return value;
  }

  return 'services';
}
