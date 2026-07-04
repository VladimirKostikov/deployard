import type { MetricsDashboardSummary } from '@dpd/shared';
import { request } from './http';

export function getMetricsDashboard() {
  return request<MetricsDashboardSummary>('/metrics/dashboard');
}
