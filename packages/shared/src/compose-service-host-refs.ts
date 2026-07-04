function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function rewriteComposeServiceReferenceValue(
  value: string,
  composeServiceNames: string[],
  resolveResourceName: (composeName: string) => string,
): string {
  let next = value;

  for (const composeName of composeServiceNames) {
    const resourceName = resolveResourceName(composeName);
    if (composeName === resourceName) {
      continue;
    }

    const pattern = new RegExp(`(//|\\b)${escapeRegExp(composeName)}(?=[:/]|\\b)`, 'g');
    next = next.replace(pattern, `$1${resourceName}`);
  }

  return next;
}

export function rewriteComposeServiceReferences(
  environment: Record<string, string>,
  composeServiceNames: string[],
  resolveResourceName: (composeName: string) => string,
): Record<string, string> {
  const sortedNames = [...composeServiceNames].sort((left, right) => right.length - left.length);
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(environment)) {
    result[key] = rewriteComposeServiceReferenceValue(value, sortedNames, resolveResourceName);
  }

  return result;
}
