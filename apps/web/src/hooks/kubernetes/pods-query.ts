import type { PodSummary } from '@dpd/shared';
import type { QueryClient } from '@tanstack/react-query';

export function podsQueryKey(namespace: string, deployment: string) {
  return ['pods', namespace, deployment] as const;
}

export function removePodFromCache(
  queryClient: QueryClient,
  namespace: string,
  deployment: string,
  podName: string,
) {
  queryClient.setQueryData<PodSummary[]>(podsQueryKey(namespace, deployment), (current) =>
    (current ?? []).filter((pod) => pod.name !== podName),
  );
}

export async function refreshPods(
  queryClient: QueryClient,
  namespace: string,
  deployment: string,
) {
  await queryClient.refetchQueries({ queryKey: podsQueryKey(namespace, deployment) });
}
