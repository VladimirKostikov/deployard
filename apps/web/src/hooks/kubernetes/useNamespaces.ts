import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useNamespaces() {
  return useQuery({
    queryKey: ['namespaces'],
    queryFn: api.getNamespaces,
  });
}
