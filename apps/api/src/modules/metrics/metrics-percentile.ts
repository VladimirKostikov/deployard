export function parseHistogramLe(leLabel: string): number {
  if (leLabel === '+Inf') {
    return Number.POSITIVE_INFINITY;
  }

  const value = Number(leLabel);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

export function mergeHistogramBuckets(
  entries: Array<{ le: number; count: number }>,
): Map<number, number> {
  const merged = new Map<number, number>();

  for (const entry of entries) {
    merged.set(entry.le, (merged.get(entry.le) ?? 0) + entry.count);
  }

  return merged;
}

export function percentileFromBuckets(buckets: Map<number, number>, quantile: number): number {
  if (quantile <= 0) {
    return 0;
  }

  const sorted = [...buckets.entries()].sort((left, right) => left[0] - right[0]);
  if (!sorted.length) {
    return 0;
  }

  const total = sorted[sorted.length - 1][1];
  if (total <= 0) {
    return 0;
  }

  const target = total * quantile;
  let previousLe = 0;
  let previousCount = 0;

  for (const [le, count] of sorted) {
    if (count < target) {
      previousLe = Number.isFinite(le) ? le : previousLe;
      previousCount = count;
      continue;
    }

    const bucketCount = count - previousCount;
    if (bucketCount <= 0) {
      return Number.isFinite(le) ? le : previousLe;
    }

    const position = (target - previousCount) / bucketCount;
    const upperBound = Number.isFinite(le) ? le : previousLe * 2 || 1;
    return previousLe + (upperBound - previousLe) * position;
  }

  const lastLe = sorted[sorted.length - 1][0];
  return Number.isFinite(lastLe) ? lastLe : 0;
}
