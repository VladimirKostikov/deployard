import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useClusters() {
  return useQuery({
    queryKey: ['clusters'],
    queryFn: () => api.getClusters(),
  });
}
