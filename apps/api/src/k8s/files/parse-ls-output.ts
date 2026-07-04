import type { PodFileEntry } from '@dpd/shared';
import { joinPodPath, resolvePodPath } from './resolve-pod-path';

const LS_PREFIX =
  /^(?<permissions>[dl-][rwx-]{9})\s+(?<nlink>\d+)\s+(?<user>\S+)\s+(?<group>\S+)\s+(?<size>\d+)\s+(?<rest>.+)$/;

const LS_DATE_TIME = /^(?<month>\w{3})\s+(?<day>\d{1,2})\s+(?<time>\d{2}:\d{2})\s+(?<name>.+)$/;
const LS_DATE_YEAR = /^(?<month>\w{3})\s+(?<day>\d{1,2})\s+(?<year>\d{4})\s+(?<name>.+)$/;

function normalizeLsName(raw: string): string {
  const trimmed = raw.trim();
  const arrowIndex = trimmed.indexOf(' -> ');

  if (arrowIndex >= 0) {
    return trimmed.slice(0, arrowIndex).trim();
  }

  return trimmed;
}

function parseLsLine(rest: string): { modifiedAt: string; name: string } | null {
  const withTime = rest.match(LS_DATE_TIME);
  if (withTime?.groups) {
    const { month, day, time, name } = withTime.groups;
    return {
      modifiedAt: `${month} ${day} ${time}`,
      name: normalizeLsName(name),
    };
  }

  const withYear = rest.match(LS_DATE_YEAR);
  if (withYear?.groups) {
    const { month, day, year, name } = withYear.groups;
    return {
      modifiedAt: `${month} ${day} ${year}`,
      name: normalizeLsName(name),
    };
  }

  return null;
}

export function parseLsOutput(parentPath: string, output: string): PodFileEntry[] {
  const basePath = resolvePodPath(parentPath);
  const entries: PodFileEntry[] = [];

  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const match = trimmed.match(LS_PREFIX);
    if (!match?.groups) {
      continue;
    }

    const parsed = parseLsLine(match.groups.rest);
    if (!parsed) {
      continue;
    }

    const { name, modifiedAt } = parsed;
    if (name === '.' || name === '..') {
      continue;
    }

    const permissions = match.groups.permissions;
    const kind = permissions.startsWith('d') ? 'directory' : 'file';

    let path: string;
    try {
      path = joinPodPath(basePath, name);
    } catch {
      continue;
    }

    entries.push({
      name,
      path,
      kind,
      size: Number(match.groups.size),
      modifiedAt,
      permissions,
    });
  }

  return entries.sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'directory' ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });
}
