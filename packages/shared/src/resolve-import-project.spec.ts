import { describe, expect, it } from 'vitest';
import type { ComposeProjectSummary } from './compose-import';
import { resolveImportProjectId } from './resolve-import-project';

describe('resolveImportProjectId', () => {
  const projects: ComposeProjectSummary[] = [
    {
      id: 'file:/workspace/demo/weather-station/compose.yml',
      name: 'weather-station',
      source: 'file',
      serviceCount: 2,
      runningCount: 0,
      buildServices: ['weather-api', 'weather-web'],
    },
  ];

  it('uses selected project id when present', () => {
    expect(
      resolveImportProjectId('file:/workspace/demo/todo-board/compose.yml', null, projects),
    ).toBe('file:/workspace/demo/todo-board/compose.yml');
  });

  it('resolves file project from preview name when selection was cleared', () => {
    expect(
      resolveImportProjectId('', { projectName: 'weather-station' } as never, projects),
    ).toBe('file:/workspace/demo/weather-station/compose.yml');
  });
});
