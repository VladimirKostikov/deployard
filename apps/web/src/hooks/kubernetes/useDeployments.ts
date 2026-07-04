import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useDeployments(namespace: string) {
  return useQuery({
    queryKey: ['deployments', namespace],
    queryFn: () => api.getDeployments(namespace),
    enabled: Boolean(namespace),
    staleTime: 0,
    refetchInterval: 3_000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
  });
}
