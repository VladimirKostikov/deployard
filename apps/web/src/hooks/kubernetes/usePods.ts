import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { podsQueryKey } from './pods-query';

interface UsePodsOptions {
  enabled?: boolean;
}

export function usePods(namespace: string, deployment: string, options?: UsePodsOptions) {
  const queryEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey: podsQueryKey(namespace, deployment),
    queryFn: () => api.getPods(namespace, deployment),
    enabled: queryEnabled && Boolean(namespace && deployment),
    staleTime: 0,
    refetchInterval: 3_000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
  });
}
