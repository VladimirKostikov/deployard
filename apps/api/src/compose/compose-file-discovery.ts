import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

const COMPOSE_FILE_NAMES = ['compose.yml', 'compose.yaml', 'docker-compose.yml', 'docker-compose.yaml'];

export interface DiscoveredComposeFile {
  path: string;
  name: string;
}

export function discoverComposeFiles(rootPaths: string[]): DiscoveredComposeFile[] {
  const found: DiscoveredComposeFile[] = [];

  for (const root of rootPaths) {
    if (!root.trim() || !existsSync(root)) {
      continue;
    }

    scanDirectory(root.trim(), found, 0);
  }

  return found.sort((left, right) => left.name.localeCompare(right.name));
}

export function readComposeFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function scanDirectory(directory: string, found: DiscoveredComposeFile[], depth: number): void {
  if (depth > 4) {
    return;
  }

  for (const fileName of COMPOSE_FILE_NAMES) {
    const composePath = join(directory, fileName);
    if (!existsSync(composePath)) {
      continue;
    }

    found.push({
      path: composePath,
      name: basename(directory),
    });
    return;
  }

  let entries: string[] = [];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') {
      continue;
    }

    const nextPath = join(directory, entry);
    try {
      if (!statSync(nextPath).isDirectory()) {
        continue;
      }
      scanDirectory(nextPath, found, depth + 1);
    } catch {
      continue;
    }
  }
}
