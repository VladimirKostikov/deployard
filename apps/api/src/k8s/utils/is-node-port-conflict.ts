interface K8sErrorShape {
  statusCode?: number;
  code?: number;
  body?: string | { message?: string };
  message?: string;
}

export function isNodePortConflict(error: unknown): boolean {
  const shape = error as K8sErrorShape;
  const statusCode = typeof shape.code === 'number' ? shape.code : shape.statusCode;
  const message = resolveErrorMessage(error);

  if (!message) {
    return statusCode === 422;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes('nodeport') &&
    (normalized.includes('already allocated') ||
      normalized.includes('provided port is already allocated') ||
      normalized.includes('invalid value'))
  );
}

function resolveErrorMessage(error: unknown): string | undefined {
  const shape = error as K8sErrorShape;

  if (typeof shape.body === 'string') {
    try {
      const parsed = JSON.parse(shape.body) as { message?: string };
      return parsed.message ?? shape.body;
    } catch {
      return shape.body;
    }
  }

  if (shape.body && typeof shape.body === 'object' && shape.body.message) {
    return shape.body.message;
  }

  return shape.message;
}
