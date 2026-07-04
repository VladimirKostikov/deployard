import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useServices(namespace: string) {
  return useQuery({
    queryKey: ['network', 'services', namespace],
    queryFn: () => api.getServices(namespace),
    enabled: Boolean(namespace),
    staleTime: 0,
    refetchInterval: 10_000,
  });
}

export function useEndpoints(namespace: string) {
  return useQuery({
    queryKey: ['network', 'endpoints', namespace],
    queryFn: () => api.getEndpoints(namespace),
    enabled: Boolean(namespace),
    staleTime: 0,
    refetchInterval: 10_000,
  });
}

export function useDeploymentServices(namespace: string, deploymentName: string) {
  return useQuery({
    queryKey: ['network', 'services', namespace, deploymentName],
    queryFn: () => api.getServicesForDeployment(namespace, deploymentName),
    enabled: Boolean(namespace && deploymentName),
    staleTime: 0,
    refetchInterval: 10_000,
  });
}
