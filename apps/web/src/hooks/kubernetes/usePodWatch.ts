import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PodSummary } from '@dpd/shared';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../../api/http';
import { getClusterContext } from '../../api/cluster-context';
import { podsQueryKey, refreshPods } from './pods-query';

type PodWatchEvent = {
  type: string;
  pod: PodSummary;
};

function applyPodEvent(pods: PodSummary[] | undefined, event: PodWatchEvent): PodSummary[] {
  if (event.type === 'DELETED') {
    return (pods ?? []).filter((pod) => pod.name !== event.pod.name);
  }

  const current = pods ?? [];
  const index = current.findIndex((pod) => pod.name === event.pod.name);

  if (index >= 0) {
    const next = [...current];
    next[index] = event.pod;
    return next;
  }

  return [...current, event.pod];
}

export function usePodWatch(namespace: string, deployment: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const queryKey = podsQueryKey(namespace, deployment);

  useEffect(() => {
    if (!namespace || !deployment) {
      return;
    }

    const socket = io('/pods', {
      path: `${getApiBaseUrl()}/ws`,
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current = socket;

    const subscribe = () => {
      socket.emit('subscribe', {
        namespace,
        deployment,
        cluster: getClusterContext(),
      });
    };

    const refetchPods = () => {
      void refreshPods(queryClient, namespace, deployment);
    };

    socket.on('connect', subscribe);
    socket.io.on('reconnect', subscribe);

    socket.on('subscribed', () => {
      refetchPods();
    });

    socket.on('pod', (event: PodWatchEvent) => {
      queryClient.setQueryData<PodSummary[]>(queryKey, (current) => applyPodEvent(current, event));
    });

    socket.on('disconnect', refetchPods);
    socket.on('error', refetchPods);

    if (socket.connected) {
      subscribe();
    }

    return () => {
      socket.emit('unsubscribe');
      socket.off('connect', subscribe);
      socket.io.off('reconnect', subscribe);
      socket.off('disconnect', refetchPods);
      socket.off('error', refetchPods);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [deployment, namespace, queryClient]);
}
