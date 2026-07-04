import { describe, expect, it } from 'vitest';
import { parseLsOutput } from './parse-ls-output';

describe('parseLsOutput', () => {
  it('parses busybox ls output with year in date', () => {
    const output = [
      'drwxr-xr-x    1 root     root          4096 Jun 23 21:56 .',
      'drwxr-xr-x    1 root     root          4096 Apr 16  2025 ..',
      '-rw-r--r--    1 root     root           497 Apr 16  2025 50x.html',
      '-rw-r--r--    1 root     root          1668 Jun 23 21:56 app.js',
    ].join('\n');

    const entries = parseLsOutput('/usr/share/nginx/html', output);

    expect(entries).toEqual([
      expect.objectContaining({ name: '50x.html', kind: 'file', size: 497 }),
      expect.objectContaining({ name: 'app.js', kind: 'file', size: 1668 }),
    ]);
  });

  it('parses gnu ls output with recent time', () => {
    const output =
      '-rw-r--r-- 1 root root 886 Jun 23 21:56 index.html';

    const entries = parseLsOutput('/var/www', output);

    expect(entries).toEqual([
      expect.objectContaining({
        name: 'index.html',
        path: '/var/www/index.html',
        modifiedAt: 'Jun 23 21:56',
      }),
    ]);
  });

  it('strips symlink targets from busybox ls names', () => {
    const output = [
      'drwxr-xr-x    1 root     root          4096 Apr 15 04:51 .',
      'lrwxrwxrwx    1 root     root            11 Apr 15 04:51 lock -> ../run/lock',
      'lrwxrwxrwx    1 root     root             6 Apr 15 04:51 run -> ../run',
      'drwxr-xr-x    1 root     root          4096 Apr 15 20:46 log',
    ].join('\n');

    const entries = parseLsOutput('/var', output);

    expect(entries).toHaveLength(3);
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'lock', path: '/var/lock', kind: 'file' }),
        expect.objectContaining({ name: 'log', path: '/var/log', kind: 'directory' }),
        expect.objectContaining({ name: 'run', path: '/var/run', kind: 'file' }),
      ]),
    );
  });
});
