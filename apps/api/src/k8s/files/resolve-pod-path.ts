import { BadRequestException } from '@nestjs/common';
import { posix } from 'node:path';

export function resolvePodPath(input: string | undefined): string {
  const raw = (input ?? '/').trim() || '/';
  const normalized = posix.normalize(raw);

  if (!normalized.startsWith('/')) {
    throw new BadRequestException('Path must be absolute');
  }

  if (normalized.includes('\0')) {
    throw new BadRequestException('Invalid path');
  }

  return normalized === '/' ? normalized : normalized.replace(/\/+$/, '') || '/';
}

export function joinPodPath(directory: string, name: string): string {
  const trimmed = name.trim();

  if (!trimmed || trimmed === '.' || trimmed === '..') {
    throw new BadRequestException('Invalid name');
  }

  if (trimmed.includes('/') || trimmed.includes('\0')) {
    throw new BadRequestException('Invalid name');
  }

  const base = resolvePodPath(directory);
  return base === '/' ? `/${trimmed}` : `${base}/${trimmed}`;
}

export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
