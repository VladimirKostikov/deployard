import type { HealthResponse } from '@dpd/shared';
import { request } from './http';

export function getHealth() {
  return request<HealthResponse>('/health');
}
