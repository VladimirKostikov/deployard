import { resolveComposeServiceFromResource } from '@dpd/shared';

export function resolveServiceImage(
  serviceName: string,
  builtImages: string[],
  taggedImages: string[],
  imageOverrides: Record<string, string> = {},
  options?: { projectName?: string },
): string | null {
  const lookupNames = buildLookupNames(serviceName, options?.projectName);

  for (const name of lookupNames) {
    const override = imageOverrides[name]?.trim();
    if (override) {
      return override;
    }
  }

  const candidates = [...new Set([...taggedImages, ...builtImages])];

  for (const name of lookupNames) {
    const match = candidates.find((image) => matchesServiceImage(name, image));
    if (match) {
      return match;
    }
  }

  return null;
}

function buildLookupNames(serviceName: string, projectName?: string): string[] {
  const names = [serviceName];

  if (projectName?.trim()) {
    const composeName = resolveComposeServiceFromResource(projectName, serviceName);
    if (composeName !== serviceName) {
      names.unshift(composeName);
    }
  }

  return names;
}

export function matchesServiceImage(serviceName: string, image: string): boolean {
  const normalized = image.toLowerCase();
  const service = serviceName.toLowerCase();

  if (
    normalized.startsWith(`${service}:`) ||
    normalized.includes(`-${service}:`) ||
    normalized.includes(`_${service}:`) ||
    normalized.endsWith(`/${service}:`)
  ) {
    return true;
  }

  const shortSuffix = service.includes('-') ? service.split('-').pop() : service;
  if (shortSuffix && shortSuffix !== service) {
    return normalized.includes(`-${shortSuffix}:`);
  }

  return false;
}
