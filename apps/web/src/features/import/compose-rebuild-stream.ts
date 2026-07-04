import type { ComposeUpResult } from '@dpd/shared';
import i18n from '../../i18n';
import { getApiBaseUrl } from '../../api/http';
import { withClusterQuery } from '../../api/cluster-context';
import type { ComposeRebuildStartOptions } from './compose-rebuild-options';

interface ComposeRebuildStreamHandlers {
  onLine: (line: string) => void;
  onComplete: (result: ComposeUpResult) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

export async function streamComposeUp(
  payload: ComposeRebuildStartOptions,
  handlers: ComposeRebuildStreamHandlers,
) {
  const cluster = payload.clusterContext;
  const path = cluster
    ? `/import/projects/up/stream?cluster=${encodeURIComponent(cluster)}`
    : withClusterQuery('/import/projects/up/stream');

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: handlers.signal,
  });

  if (response.status === 401) {
    handlers.onError(i18n.t('import:errors.authRequired'));
    return;
  }

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody && typeof errorBody.message === 'string'
        ? errorBody.message
        : `Request failed: ${response.status}`;
    handlers.onError(message);
    return;
  }

  await readSseStream(response.body, handlers);
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: ComposeRebuildStreamHandlers,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const blockEnd = buffer.indexOf('\n\n');
      if (blockEnd === -1) {
        break;
      }

      const block = buffer.slice(0, blockEnd);
      buffer = buffer.slice(blockEnd + 2);
      handleSseBlock(block, handlers);
    }
  }
}

function handleSseBlock(block: string, handlers: ComposeRebuildStreamHandlers) {
  const lines = block.split('\n');
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return;
  }

  const raw = dataLines.join('\n');

  try {
    const payload = JSON.parse(raw) as Record<string, unknown>;

    if (eventName === 'complete') {
      handlers.onComplete(payload as unknown as ComposeUpResult);
      return;
    }

    if (eventName === 'error') {
      handlers.onError(typeof payload.message === 'string' ? payload.message : i18n.t('import:errors.composeUpFailed'));
      return;
    }

    if (typeof payload.line === 'string') {
      handlers.onLine(payload.line);
    }
  } catch {
    handlers.onLine(raw);
  }
}
