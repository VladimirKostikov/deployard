import { spawn } from 'node:child_process';

export type DockerStreamKind = 'stdout' | 'stderr';

export interface DockerStreamHandle {
  promise: Promise<number>;
  kill: () => void;
}

export function runDockerStream(
  args: string[],
  cwd: string | undefined,
  onLine: (line: string, stream: DockerStreamKind) => void,
): DockerStreamHandle {
  const processRef = spawn('docker', args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (!processRef.stdout || !processRef.stderr) {
    throw new Error('Docker process streams are unavailable');
  }

  attachLineStream(processRef.stdout, 'stdout', onLine);
  attachLineStream(processRef.stderr, 'stderr', onLine);

  const promise = new Promise<number>((resolve, reject) => {
    processRef.on('error', reject);
    processRef.on('close', (code) => {
      if (code === 0) {
        resolve(0);
        return;
      }
      reject(new Error(`docker compose exited with code ${code ?? 1}`));
    });
  });

  return {
    promise,
    kill: () => {
      processRef.kill('SIGTERM');
    },
  };
}

function attachLineStream(
  stream: NodeJS.ReadableStream,
  kind: DockerStreamKind,
  onLine: (line: string, stream: DockerStreamKind) => void,
) {
  let buffer = '';

  stream.on('data', (chunk: Buffer | string) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (part.length > 0) {
        onLine(part, kind);
      }
    }
  });

  stream.on('end', () => {
    if (buffer.length > 0) {
      onLine(buffer, kind);
    }
  });
}
