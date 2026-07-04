import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useDeployment(namespace: string, name: string) {
  return useQuery({
    queryKey: ['deployment', namespace, name],
    queryFn: () => api.getDeployment(namespace, name),
    enabled: Boolean(namespace && name),
    staleTime: 0,
    refetchInterval: 3_000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
  });
}
