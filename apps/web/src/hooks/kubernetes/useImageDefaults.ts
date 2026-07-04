import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export function useImageDefaults(image: string, containerPort?: number) {
  return useQuery({
    queryKey: ['image-defaults', image, containerPort],
    queryFn: () => api.getImageDefaults(image, containerPort),
    enabled: Boolean(image.trim()),
    staleTime: 60_000,
  });
}
