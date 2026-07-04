import type { ClusterSummary } from '@dpd/shared';
import { request } from './http';

export function getClusters() {
  return request<ClusterSummary[]>('/clusters');
}
