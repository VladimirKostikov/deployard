import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useDeploymentHealth(namespace: string, name: string, enabled = true) {
  return useQuery({
    queryKey: ['deployment', namespace, name, 'health'],
    queryFn: () => api.getDeploymentHealth(namespace, name),
    enabled: enabled && Boolean(namespace && name),
    staleTime: 0,
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  });
}
