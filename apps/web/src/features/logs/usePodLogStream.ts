import { useEffect, useRef, useState } from 'react';
import { buildPodLogsUrl } from '../../api';

export function usePodLogStream(namespace: string, deployment: string, podName: string) {
  const [lines, setLines] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    if (!namespace || !deployment || !podName) {
      return;
    }

    setLines([]);
    setHasError(false);
    setIsStreaming(true);

    const source = new EventSource(buildPodLogsUrl(namespace, deployment, podName));

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { line?: string };
        if (payload.line) {
          setLines((current) => [...current, payload.line as string]);
        }
      } catch {
        setLines((current) => [...current, event.data]);
      }
    };

    source.addEventListener('error', () => {
      setHasError(true);
      setIsStreaming(false);
      source.close();
    });

    return () => {
      source.close();
      setIsStreaming(false);
    };
  }, [namespace, deployment, podName]);

  return { lines, isStreaming, hasError, autoScrollRef };
}
