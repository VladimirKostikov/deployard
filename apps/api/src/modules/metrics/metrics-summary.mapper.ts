import type { MetricsDashboardSummary } from '@dpd/shared';
import {
  mergeHistogramBuckets,
  parseHistogramLe,
  percentileFromBuckets,
} from './metrics-percentile';

interface PromMetricValue {
  labels?: Record<string, string | number | undefined>;
  value?: number;
}

export interface PromMetricEntry {
  name: string;
  values?: PromMetricValue[];
}

interface RouteAccumulator {
  total: number;
  errorCount: number;
  durationSum: number;
  durationCount: number;
}

function readScalarMetric(entries: PromMetricEntry[], name: string): number {
  const metric = entries.find((entry) => entry.name === name);
  return Number(metric?.values?.[0]?.value ?? 0);
}

function isServerError(status: string): boolean {
  const code = Number(status);
  return Number.isFinite(code) && code >= 500;
}

export function buildDashboardSummary(entries: PromMetricEntry[]): MetricsDashboardSummary {
  const requestMetric = entries.find((entry) => entry.name === 'http_requests_total');
  const bucketMetric = entries.find((entry) => entry.name === 'http_request_duration_seconds_bucket');
  const durationCountMetric = entries.find(
    (entry) => entry.name === 'http_request_duration_seconds_count',
  );
  const durationSumMetric = entries.find(
    (entry) => entry.name === 'http_request_duration_seconds_sum',
  );

  const byStatus = new Map<string, number>();
  const byMethod = new Map<string, number>();
  const routes = new Map<string, RouteAccumulator>();
  let httpRequestsTotal = 0;
  let httpErrorCount = 0;

  for (const entry of requestMetric?.values ?? []) {
    const status = String(entry.labels?.status ?? 'unknown');
    const method = String(entry.labels?.method ?? 'unknown');
    const route = String(entry.labels?.route ?? 'unknown');
    const value = Number(entry.value ?? 0);

    httpRequestsTotal += value;
    byStatus.set(status, (byStatus.get(status) ?? 0) + value);
    byMethod.set(method, (byMethod.get(method) ?? 0) + value);

    const routeStats = routes.get(route) ?? {
      total: 0,
      errorCount: 0,
      durationSum: 0,
      durationCount: 0,
    };
    routeStats.total += value;
    if (isServerError(status)) {
      routeStats.errorCount += value;
      httpErrorCount += value;
    }
    routes.set(route, routeStats);
  }

  for (const entry of durationCountMetric?.values ?? []) {
    const route = String(entry.labels?.route ?? 'unknown');
    const routeStats = routes.get(route) ?? {
      total: 0,
      errorCount: 0,
      durationSum: 0,
      durationCount: 0,
    };
    routeStats.durationCount += Number(entry.value ?? 0);
    routes.set(route, routeStats);
  }

  for (const entry of durationSumMetric?.values ?? []) {
    const route = String(entry.labels?.route ?? 'unknown');
    const routeStats = routes.get(route) ?? {
      total: 0,
      errorCount: 0,
      durationSum: 0,
      durationCount: 0,
    };
    routeStats.durationSum += Number(entry.value ?? 0);
    routes.set(route, routeStats);
  }

  const durationCount = Number(durationCountMetric?.values?.reduce(
    (sum, entry) => sum + Number(entry.value ?? 0),
    0,
  ) ?? 0);
  const durationSum = Number(durationSumMetric?.values?.reduce(
    (sum, entry) => sum + Number(entry.value ?? 0),
    0,
  ) ?? 0);

  const bucketEntries = (bucketMetric?.values ?? []).map((entry) => ({
    le: parseHistogramLe(String(entry.labels?.le ?? '+Inf')),
    count: Number(entry.value ?? 0),
  }));
  const mergedBuckets = mergeHistogramBuckets(bucketEntries);

  const startTime = readScalarMetric(entries, 'process_start_time_seconds');
  const processUptimeSeconds = startTime > 0 ? Math.max(0, Date.now() / 1000 - startTime) : 0;

  return {
    collectedAt: new Date().toISOString(),
    httpRequestsTotal,
    httpRequestsPerSecond:
      processUptimeSeconds > 0 ? httpRequestsTotal / processUptimeSeconds : 0,
    httpErrorCount,
    httpErrorRate: httpRequestsTotal > 0 ? httpErrorCount / httpRequestsTotal : 0,
    httpRequestsByStatus: [...byStatus.entries()]
      .map(([status, total]) => ({ status, total }))
      .sort((left, right) => right.total - left.total),
    httpRequestsByMethod: [...byMethod.entries()]
      .map(([method, total]) => ({ method, total }))
      .sort((left, right) => right.total - left.total),
    httpRouteDetails: [...routes.entries()]
      .map(([route, stats]) => ({
        route,
        total: stats.total,
        errorCount: stats.errorCount,
        avgDurationSeconds:
          stats.durationCount > 0 ? stats.durationSum / stats.durationCount : 0,
      }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 20),
    httpLatency: {
      sampleCount: durationCount,
      avgSeconds: durationCount > 0 ? durationSum / durationCount : 0,
      p50Seconds: percentileFromBuckets(mergedBuckets, 0.5),
      p95Seconds: percentileFromBuckets(mergedBuckets, 0.95),
      p99Seconds: percentileFromBuckets(mergedBuckets, 0.99),
    },
    process: {
      uptimeSeconds: processUptimeSeconds,
      memoryRssBytes: readScalarMetric(entries, 'process_resident_memory_bytes'),
      memoryHeapUsedBytes: readScalarMetric(entries, 'nodejs_heap_size_used_bytes'),
      memoryHeapTotalBytes: readScalarMetric(entries, 'nodejs_heap_size_total_bytes'),
      cpuUserSeconds: readScalarMetric(entries, 'process_cpu_user_seconds_total'),
      cpuSystemSeconds: readScalarMetric(entries, 'process_cpu_system_seconds_total'),
      eventLoopLagSeconds: readScalarMetric(entries, 'nodejs_eventloop_lag_seconds'),
    },
  };
}
