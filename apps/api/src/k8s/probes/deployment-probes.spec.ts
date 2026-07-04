import { describe, expect, it } from 'vitest';
import { buildProbes, resolveContainerSetup } from './deployment-probes';

describe('resolveContainerSetup', () => {
  it('uses tcp probe on 6379 for redis images', () => {
    expect(resolveContainerSetup('redis:7-alpine', 80)).toEqual({
      containerPort: 6379,
      probeKind: 'tcp',
      probePort: 6379,
    });
  });

  it('uses http probe for nginx on port 80', () => {
    expect(resolveContainerSetup('nginx:1.27-alpine', 80)).toEqual({
      containerPort: 80,
      probeKind: 'http',
      probePort: 80,
    });
  });

  it('skips probes for generic runtimes', () => {
    expect(resolveContainerSetup('node:22-alpine', 3000)).toEqual({
      containerPort: 3000,
      probeKind: 'http',
      probePort: 3000,
    });

    expect(resolveContainerSetup('golang:1.24-alpine', 9090)).toEqual({
      containerPort: 9090,
      probeKind: 'none',
      probePort: 9090,
    });
  });
});

describe('buildProbes', () => {
  it('returns empty probes when kind is none', () => {
    expect(buildProbes('none', 8080)).toEqual({});
  });

  it('builds tcp probes for redis', () => {
    const probes = buildProbes('tcp', 6379);
    expect(probes.readinessProbe?.tcpSocket).toEqual({ port: 6379 });
    expect(probes.livenessProbe?.tcpSocket).toEqual({ port: 6379 });
  });
});
