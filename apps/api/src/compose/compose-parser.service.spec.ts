import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ComposeParserService } from './compose-parser.service';

describe('ComposeParserService', () => {
  const parser = new ComposeParserService();
  const demoCompose = readFileSync(
    resolve(__dirname, '../../../../demo/demo-shop/compose.yml'),
    'utf8',
  );

  it('parses demo compose services', () => {
    const parsed = parser.parse(demoCompose, 'demo-shop');

    expect(parsed.projectName).toBe('demo-shop');
    expect(parsed.services.map((service) => service.name)).toEqual([
      'postgres',
      'demo-api',
      'web',
    ]);
  });

  it('parses ports and environment', () => {
    const parsed = parser.parse(demoCompose);
    const postgres = parsed.services.find((service) => service.name === 'postgres');
    const demoApi = parsed.services.find((service) => service.name === 'demo-api');

    expect(postgres?.ports[0]).toEqual({ containerPort: 5432, hostPort: 5433 });
    expect(postgres?.environment.POSTGRES_DB).toBe('shop');
    expect(demoApi?.build).toBe(true);
    expect(demoApi?.dependsOn).toEqual(['postgres']);
  });
});
