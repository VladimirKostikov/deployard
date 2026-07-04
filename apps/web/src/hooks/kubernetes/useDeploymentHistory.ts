import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useDeploymentHistory(namespace: string, name: string) {
  return useQuery({
    queryKey: ['deployments', namespace, name, 'history'],
    queryFn: () => api.getDeploymentHistory(namespace, name),
    enabled: Boolean(namespace && name),
  });
}
