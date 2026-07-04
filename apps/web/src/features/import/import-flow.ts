export type ImportSourceMode = 'projects' | 'yaml';

export function hasValidSource(
  mode: ImportSourceMode,
  selectedProjectId: string,
  composeYaml: string,
): boolean {
  if (mode === 'yaml') {
    return composeYaml.trim().length > 0;
  }

  return selectedProjectId.trim().length > 0;
}
