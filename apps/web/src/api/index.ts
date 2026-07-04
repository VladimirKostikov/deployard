import * as adminApi from './admin.api';
import * as authApi from './auth.api';
import * as clustersApi from './clusters.api';
import * as deploymentsApi from './deployments.api';
import * as healthApi from './health.api';
import * as networkApi from './network.api';
import * as ingressApi from './ingress.api';
import * as namespacesApi from './namespaces.api';
import * as podsApi from './pods.api';
import * as podFilesApi from './pod-files.api';
import * as metricsApi from './metrics.api';
import * as importApi from './import.api';

export const api = {
  ...authApi,
  ...adminApi,
  ...clustersApi,
  ...namespacesApi,
  ...deploymentsApi,
  ...podsApi,
  ...podFilesApi,
  ...ingressApi,
  ...networkApi,
  ...importApi,
  ...metricsApi,
  ...healthApi,
};

export { buildPodLogsUrl } from './pods.api';
