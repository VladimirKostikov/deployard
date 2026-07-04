import type { ComposeUpResult } from '@dpd/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamComposeUp } from './compose-rebuild-stream';
import type { ComposeRebuildStartOptions } from './compose-rebuild-options';

export type ComposeRebuildStatus = 'idle' | 'running' | 'success' | 'error';

interface UseComposeRebuildOptions {
  onSuccess?: (result: ComposeUpResult) => void;
}

export function useComposeRebuild(options: UseComposeRebuildOptions = {}) {
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<ComposeRebuildStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onSuccessRef = useRef(options.onSuccess);

  useEffect(() => {
    onSuccessRef.current = options.onSuccess;
  }, [options.onSuccess]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const start = useCallback(async (options: ComposeRebuildStartOptions) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLines([]);
    setErrorMessage(null);
    setStatus('running');

    await streamComposeUp(options, {
      signal: controller.signal,
      onLine: (line) => {
        setLines((current) => [...current, line]);
      },
      onComplete: (result) => {
        setStatus('success');
        onSuccessRef.current?.(result);
      },
      onError: (message) => {
        if (controller.signal.aborted) {
          return;
        }
        setStatus('error');
        setErrorMessage(message);
        setLines((current) => [...current, message]);
      },
    });
  }, []);

  return {
    lines,
    status,
    errorMessage,
    isRunning: status === 'running',
    start,
  };
}
