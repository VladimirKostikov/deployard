import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useDeploymentConfig(namespace: string, name: string) {
  return useQuery({
    queryKey: ['deployments', namespace, name, 'config'],
    queryFn: () => api.getDeploymentConfig(namespace, name),
    enabled: Boolean(namespace && name),
  });
}
