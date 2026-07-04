export interface IngressSummary {
  name: string;
  namespace: string;
  hosts: string[];
  paths: string[];
  serviceName: string;
  servicePort: number;
  createdAt: string;
}

export interface CreateIngressRequest {
  name: string;
  namespace: string;
  host: string;
  path: string;
  serviceName: string;
  servicePort: number;
}
