import { ContainerImageOption } from './types';

export const observabilityImageOptions: ContainerImageOption[] = [
  { name: 'Alertmanager', image: 'prom/alertmanager:v0.28.0', category: 'Observability', icon: 'prometheus', defaultPort: 9093 },
  { name: 'cAdvisor', image: 'gcr.io/cadvisor/cadvisor:v0.51.0', category: 'Observability', icon: 'google', defaultPort: 8080 },
  { name: 'Elastic APM', image: 'docker.elastic.co/apm/apm-server:8.15.0', category: 'Observability', icon: 'elastic', defaultPort: 8200 },
  { name: 'Filebeat', image: 'docker.elastic.co/beats/filebeat:8.15.0', category: 'Observability', icon: 'elastic', defaultPort: 5066 },
  { name: 'Fluent Bit', image: 'fluent/fluent-bit:3.2', category: 'Observability', icon: 'fluentbit', defaultPort: 2020 },
  { name: 'Grafana', image: 'grafana/grafana:11.3.0', category: 'Observability', icon: 'grafana', defaultPort: 3000 },
  { name: 'Jaeger', image: 'jaegertracing/all-in-one:1.63', category: 'Observability', icon: 'jaeger', defaultPort: 16686 },
  { name: 'Kibana', image: 'docker.elastic.co/kibana/kibana:8.15.0', category: 'Observability', icon: 'kibana', defaultPort: 5601 },
  { name: 'Logstash', image: 'docker.elastic.co/logstash/logstash:8.15.0', category: 'Observability', icon: 'elastic', defaultPort: 9600 },
  { name: 'Loki', image: 'grafana/loki:3.3.0', category: 'Observability', icon: 'grafana', defaultPort: 3100 },
  { name: 'Mimir', image: 'grafana/mimir:2.14.0', category: 'Observability', icon: 'grafana', defaultPort: 8080 },
  { name: 'Netdata', image: 'netdata/netdata:stable', category: 'Observability', icon: 'netdata', defaultPort: 19999 },
  { name: 'OpenTelemetry', image: 'otel/opentelemetry-collector-contrib:0.116.1', category: 'Observability', icon: 'opentelemetry', defaultPort: 4318 },
  { name: 'Prometheus', image: 'prom/prometheus:v2.55.0', category: 'Observability', icon: 'prometheus', defaultPort: 9090 },
  { name: 'SigNoz', image: 'signoz/signoz:v0.76.0', category: 'Observability', icon: 'signoz', defaultPort: 8080 },
  { name: 'Tempo', image: 'grafana/tempo:2.6.0', category: 'Observability', icon: 'grafana', defaultPort: 3200 },
  { name: 'Thanos', image: 'quay.io/thanos/thanos:v0.37.0', category: 'Observability', icon: 'thanos', defaultPort: 10902 },
  { name: 'Uptime Kuma', image: 'louislam/uptime-kuma:1.23.15', category: 'Observability', icon: 'uptimekuma', defaultPort: 3001 },
  { name: 'Zipkin', image: 'openzipkin/zipkin:3.4', category: 'Observability', icon: 'zipkin', defaultPort: 9411 },
];
