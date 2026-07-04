interface RequestLike {
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

function readNamespace(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

export function resolveRequestNamespace(request: RequestLike): string | undefined {
  return (
    readNamespace(request.query?.namespace) ??
    readNamespace(request.params?.namespace) ??
    readNamespace(request.body?.namespace)
  );
}
