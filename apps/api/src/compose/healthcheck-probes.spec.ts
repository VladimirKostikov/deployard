import { describe, expect, it } from 'vitest';
import { buildExecProbeCommand, buildProbesFromCompose } from './healthcheck-probes';

describe('healthcheck-probes', () => {
  it('maps CMD-SHELL healthcheck to sh -c exec probe', () => {
    const command = buildExecProbeCommand(['CMD-SHELL', 'pg_isready -U shop -d shop']);

    expect(command).toEqual(['sh', '-c', 'pg_isready -U shop -d shop']);
  });

  it('maps CMD healthcheck to argv exec probe', () => {
    const command = buildExecProbeCommand(['CMD', 'pg_isready', '-U', 'shop']);

    expect(command).toEqual(['pg_isready', '-U', 'shop']);
  });

  it('uses /health for api services on port 3000 without compose healthcheck', () => {
    const probes = buildProbesFromCompose('demo-shop-api:local', 3000);

    expect(probes.readinessProbe?.httpGet?.path).toBe('/health');
    expect(probes.readinessProbe?.httpGet?.port).toBe(3000);
  });
});
