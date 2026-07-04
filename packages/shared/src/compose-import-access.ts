import type { ComposeImportBrowserAccess } from './compose-import';

export function pickComposeImportWebAccess(
  entries: ComposeImportBrowserAccess[],
): ComposeImportBrowserAccess | undefined {
  if (entries.length === 0) {
    return undefined;
  }

  const webEntry = entries.find(
    (entry) => entry.servicePort === 80 || entry.servicePort === 8080,
  );

  return webEntry ?? entries[0];
}
