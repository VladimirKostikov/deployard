export type HealthStatus = 'ok';

export type ReadyStatus = 'ready' | 'not_ready';

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
}

export interface ReadyResponse {
  status: ReadyStatus;
  k8s: boolean;
  timestamp: string;
}
