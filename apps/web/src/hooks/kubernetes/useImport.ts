import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useImportEnvironment() {
  return useQuery({
    queryKey: ['import', 'environment'],
    queryFn: api.getImportEnvironment,
    staleTime: 30_000,
  });
}

export function useComposeProjects(enabled = true) {
  return useQuery({
    queryKey: ['import', 'projects'],
    queryFn: api.discoverComposeProjects,
    enabled,
  });
}
