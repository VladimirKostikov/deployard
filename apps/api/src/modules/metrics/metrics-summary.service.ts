import { Injectable } from '@nestjs/common';
import { MetricsDashboardSummary } from '@dpd/shared';
import { MetricsRegistry } from './metrics.registry';
import { buildDashboardSummary, type PromMetricEntry } from './metrics-summary.mapper';

@Injectable()
export class MetricsSummaryService {
  constructor(private readonly metricsRegistry: MetricsRegistry) {}

  async getDashboardSummary(): Promise<MetricsDashboardSummary> {
    const metrics = await this.metricsRegistry.registry.getMetricsAsJSON();
    return buildDashboardSummary(metrics as PromMetricEntry[]);
  }
}
