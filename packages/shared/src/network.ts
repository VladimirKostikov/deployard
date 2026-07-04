export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';

export interface ServicePortSummary {
  name?: string;
  port: number;
  targetPort: number;
  nodePort?: number;
  protocol: string;
}

export interface ServiceSummary {
  name: string;
  namespace: string;
  type: ServiceType;
  clusterIp: string;
  ports: ServicePortSummary[];
  selector: Record<string, string>;
  createdAt: string;
}

export interface CreateServiceRequest {
  name: string;
  namespace: string;
  deploymentName: string;
  port: number;
  targetPort?: number;
}

export interface UpdateServiceRequest {
  namespace: string;
  name: string;
  type?: ServiceType;
  ports?: ServicePortSummary[];
}

export interface ServiceTunnelSummary {
  id: string;
  namespace: string;
  serviceName: string;
  servicePort: number;
  localPort: number;
  status: 'starting' | 'active' | 'error';
  proxyUrl: string;
  error?: string;
}

export interface StartServiceTunnelRequest {
  namespace: string;
  serviceName: string;
  servicePort: number;
}

export interface ServiceAccessRequest {
  namespace: string;
  serviceName: string;
  servicePort: number;
}

export interface ServiceAccessResult {
  url: string;
  localPort: number;
  tunnelId: string;
  namespace: string;
  serviceName: string;
}

export interface EndpointAddressSummary {
  ip: string;
  podName?: string;
  nodeName?: string;
  ready: boolean;
}

export interface EndpointPortSummary {
  name?: string;
  port: number;
  protocol: string;
}

export interface EndpointSummary {
  name: string;
  namespace: string;
  addresses: EndpointAddressSummary[];
  ports: EndpointPortSummary[];
}
