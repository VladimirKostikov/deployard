export function parseRollbackTargetRevision(changeCause?: string): number | null {
  if (!changeCause) {
    return null;
  }

  const match = changeCause.match(/Rollback to revision (\d+)/);
  if (!match?.[1]) {
    return null;
  }

  return Number(match[1]);
}

export function isRollbackRevision(changeCause?: string): boolean {
  return parseRollbackTargetRevision(changeCause) !== null;
}
