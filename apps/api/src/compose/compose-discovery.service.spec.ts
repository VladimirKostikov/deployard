import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ComposeDiscoveryService } from './compose-discovery.service';
import { ComposeParserService } from './compose-parser.service';
import { DockerScanService } from './docker-scan.service';

const demoRoot = resolve(__dirname, '../../../../demo');

describe('ComposeDiscoveryService', () => {
  const parser = new ComposeParserService();
  const configService = {
    get: vi.fn((key: string, defaultValue?: string) => {
      if (key === 'COMPOSE_DISCOVERY_PATHS') {
        return demoRoot;
      }
      return defaultValue;
    }),
  };
  const dockerScan = {
    scanProjects: vi.fn(() => ({
      available: true,
      projects: [{ name: 'demo', serviceCount: 3, runningCount: 3 }],
    })),
    exportProjectCompose: vi.fn(() => 'services:\n  api:\n    image: demo-api:local\n'),
  } as unknown as DockerScanService;

  it('returns docker compose projects', () => {
    const service = new ComposeDiscoveryService(configService as never, parser, dockerScan);
    const result = service.discoverProjects();

    expect(result.available).toBe(true);
    expect(result.projects.some((project) => project.id === 'docker:demo')).toBe(true);
  });

  it('loads compose yaml from docker project id', () => {
    const service = new ComposeDiscoveryService(configService as never, parser, dockerScan);

    const loaded = service.loadProjectCompose('docker:demo');

    expect(loaded.projectName).toBe('demo');
    expect(loaded.composeYaml).toContain('demo-api');
  });

  it('uses compose file name field for discovered file project ids', () => {
    const service = new ComposeDiscoveryService(configService as never, parser, dockerScan);
    const discovered = service.discoverProjects();
    const fileProject = discovered.projects.find((project) => project.source === 'file');

    expect(fileProject).toBeDefined();

    const loaded = service.loadProjectCompose(fileProject!.id);

    expect(loaded.projectName).toBe('demo-shop');
  });

  it('rejects arbitrary file project ids', () => {
    const service = new ComposeDiscoveryService(configService as never, parser, dockerScan);

    expect(() => service.loadProjectCompose('file:/etc/passwd')).toThrow(
      'Compose project is not available for import',
    );
  });

  it('rejects unknown docker project ids', () => {
    const service = new ComposeDiscoveryService(configService as never, parser, dockerScan);

    expect(() => service.loadProjectCompose('docker:unknown-project')).toThrow(
      'Compose project is not available for import',
    );
  });
});
