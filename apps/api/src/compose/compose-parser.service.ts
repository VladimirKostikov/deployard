import { Injectable } from '@nestjs/common';
import { parse as parseYaml } from 'yaml';
import {
  ParsedComposeFile,
  ParsedComposeHealthcheck,
  ParsedComposePort,
  ParsedComposeService,
} from './compose-plan.types';

interface RawComposeService {
  image?: string;
  build?: unknown;
  ports?: unknown[];
  environment?: unknown;
  depends_on?: unknown;
  volumes?: unknown[];
  healthcheck?: {
    test?: unknown;
    interval?: string;
    timeout?: string;
    retries?: number;
  };
}

interface RawComposeDocument {
  name?: string;
  services?: Record<string, RawComposeService>;
  volumes?: Record<string, unknown>;
}

@Injectable()
export class ComposeParserService {
  parse(composeYaml: string, projectName?: string): ParsedComposeFile {
    let document: RawComposeDocument;

    try {
      document = parseYaml(composeYaml) as RawComposeDocument;
    } catch {
      throw new Error('Invalid YAML syntax');
    }

    if (!document?.services || typeof document.services !== 'object') {
      throw new Error('Compose file must define a services section');
    }

    const resolvedProjectName =
      projectName?.trim() ||
      document.name?.trim() ||
      'compose-project';

    const namedVolumes = Object.keys(document.volumes ?? {});
    const services = Object.entries(document.services).map(([name, raw]) =>
      this.parseService(name, raw),
    );

    return { projectName: resolvedProjectName, services, namedVolumes };
  }

  private parseService(name: string, raw: RawComposeService): ParsedComposeService {
    return {
      name,
      image: typeof raw.image === 'string' ? raw.image : undefined,
      build: raw.build !== undefined,
      ports: this.parsePorts(raw.ports ?? []),
      environment: this.parseEnvironment(raw.environment),
      dependsOn: this.parseDependsOn(raw.depends_on),
      volumes: this.parseVolumeRefs(raw.volumes ?? []),
      healthcheck: this.parseHealthcheck(raw.healthcheck),
    };
  }

  private parsePorts(values: unknown[]): ParsedComposePort[] {
    return values
      .map((entry) => this.parsePort(entry))
      .filter((entry): entry is ParsedComposePort => entry !== null);
  }

  private parsePort(entry: unknown): ParsedComposePort | null {
    if (typeof entry === 'number') {
      return { containerPort: entry };
    }

    if (typeof entry !== 'string') {
      return null;
    }

    const [hostPart, containerPart] = entry.split(':');
    const containerPort = Number(containerPart ?? hostPart);

    if (!Number.isFinite(containerPort) || containerPort <= 0) {
      return null;
    }

    if (containerPart !== undefined) {
      const hostPort = Number(hostPart);
      return Number.isFinite(hostPort) && hostPort > 0
        ? { containerPort, hostPort }
        : { containerPort };
    }

    return { containerPort };
  }

  private parseEnvironment(value: unknown): Record<string, string> {
    if (!value) {
      return {};
    }

    if (Array.isArray(value)) {
      return value.reduce<Record<string, string>>((acc, entry) => {
        if (typeof entry !== 'string' || !entry.includes('=')) {
          return acc;
        }

        const separatorIndex = entry.indexOf('=');
        const key = entry.slice(0, separatorIndex).trim();
        const envValue = entry.slice(separatorIndex + 1);
        if (key) {
          acc[key] = envValue;
        }
        return acc;
      }, {});
    }

    if (typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
        (acc, [key, envValue]) => {
          if (envValue === undefined || envValue === null) {
            return acc;
          }
          acc[key] = String(envValue);
          return acc;
        },
        {},
      );
    }

    return {};
  }

  private parseDependsOn(value: unknown): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === 'string');
    }

    if (typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>);
    }

    return [];
  }

  private parseVolumeRefs(values: unknown[]): string[] {
    return values
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  private parseHealthcheck(
    value?: RawComposeService['healthcheck'],
  ): ParsedComposeHealthcheck | undefined {
    if (!value?.test) {
      return undefined;
    }

    const test = Array.isArray(value.test)
      ? value.test.map(String)
      : [String(value.test)];

    return {
      test,
      intervalSeconds: this.parseDuration(value.interval),
      timeoutSeconds: this.parseDuration(value.timeout),
      retries: value.retries,
    };
  }

  private parseDuration(value?: string): number | undefined {
    if (!value || value.length < 2) {
      return undefined;
    }

    const unit = value.slice(-1);
    const amount = Number(value.slice(0, -1));
    if (!Number.isFinite(amount)) {
      return undefined;
    }

    if (unit === 's') {
      return amount;
    }

    if (unit === 'm') {
      return amount * 60;
    }

    return undefined;
  }
}
