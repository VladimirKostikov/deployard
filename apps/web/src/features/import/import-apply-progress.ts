export type ImportApplyPhase = 'build' | 'load' | 'apply' | 'done';

export interface ImportApplyProgress {
  phase: ImportApplyPhase;
  percent: number;
}

export function importApplyPercent(phase: ImportApplyPhase): number {
  if (phase === 'build') {
    return 25;
  }
  if (phase === 'load') {
    return 60;
  }
  if (phase === 'apply') {
    return 90;
  }
  return 100;
}
