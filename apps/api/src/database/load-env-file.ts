import { readFileSync } from 'node:fs';
import path from 'node:path';

export function loadEnvFile() {
  const candidates = [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];

  for (const file of candidates) {
    try {
      const content = readFileSync(file, 'utf8');

      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        const index = trimmed.indexOf('=');
        if (index === -1) {
          continue;
        }

        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim();

        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }

      return;
    } catch {
      continue;
    }
  }
}
