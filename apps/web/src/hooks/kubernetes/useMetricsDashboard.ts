import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useMetricsDashboard() {
  return useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: () => api.getMetricsDashboard(),
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  });
}
