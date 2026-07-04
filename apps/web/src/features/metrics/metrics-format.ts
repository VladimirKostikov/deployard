export function formatMemory(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }

  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${(mb / 1024).toFixed(2)} GB`;
}

export function formatMilliseconds(seconds: number): string {
  if (seconds <= 0) {
    return '0 ms';
  }

  const ms = seconds * 1000;
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)} µs`;
  }

  if (ms < 1000) {
    return `${ms.toFixed(1)} ms`;
  }

  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatRate(value: number): string {
  if (value <= 0) {
    return '0';
  }

  if (value < 10) {
    return value.toFixed(2);
  }

  return value.toFixed(1);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDuration(
  seconds: number,
  units: { seconds: string; minutes: string; hours: string },
): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} ${units.seconds}`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${units.minutes}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} ${units.hours}`;
  }

  return `${hours} ${units.hours} ${remainingMinutes} ${units.minutes}`;
}

export function formatCpuSeconds(seconds: number): string {
  if (seconds <= 0) {
    return '0 s';
  }

  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }

  const minutes = Math.floor(seconds / 60);
  return `${minutes} min ${Math.round(seconds % 60)} s`;
}

export function statusVariant(status: string): 'ok' | 'warn' | 'error' | 'idle' {
  const code = Number(status);
  if (!Number.isFinite(code)) {
    return 'idle';
  }

  if (code >= 500) {
    return 'error';
  }

  if (code >= 400) {
    return 'warn';
  }

  return 'ok';
}
