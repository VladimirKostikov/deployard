export interface MetricsStatusStat {
  status: string;
  total: number;
}

export interface MetricsMethodStat {
  method: string;
  total: number;
}

export interface MetricsRouteDetailStat {
  route: string;
  total: number;
  avgDurationSeconds: number;
  errorCount: number;
}

export interface MetricsLatencySummary {
  sampleCount: number;
  avgSeconds: number;
  p50Seconds: number;
  p95Seconds: number;
  p99Seconds: number;
}

export interface MetricsProcessSummary {
  uptimeSeconds: number;
  memoryRssBytes: number;
  memoryHeapUsedBytes: number;
  memoryHeapTotalBytes: number;
  cpuUserSeconds: number;
  cpuSystemSeconds: number;
  eventLoopLagSeconds: number;
}

export interface MetricsDashboardSummary {
  collectedAt: string;
  httpRequestsTotal: number;
  httpRequestsPerSecond: number;
  httpErrorCount: number;
  httpErrorRate: number;
  httpRequestsByStatus: MetricsStatusStat[];
  httpRequestsByMethod: MetricsMethodStat[];
  httpRouteDetails: MetricsRouteDetailStat[];
  httpLatency: MetricsLatencySummary;
  process: MetricsProcessSummary;
}
