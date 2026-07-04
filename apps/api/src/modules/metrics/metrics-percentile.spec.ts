import { describe, expect, it } from 'vitest';
import {
  mergeHistogramBuckets,
  percentileFromBuckets,
} from './metrics-percentile';

describe('metrics-percentile', () => {
  it('computes p95 from merged histogram buckets', () => {
    const buckets = mergeHistogramBuckets([
      { le: 0.1, count: 50 },
      { le: 0.5, count: 90 },
      { le: 1, count: 100 },
    ]);

    const p95 = percentileFromBuckets(buckets, 0.95);

    expect(p95).toBeGreaterThan(0.5);
    expect(p95).toBeLessThanOrEqual(1);
  });

  it('returns zero for empty buckets', () => {
    expect(percentileFromBuckets(new Map(), 0.95)).toBe(0);
  });
});
