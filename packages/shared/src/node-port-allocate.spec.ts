import { describe, expect, it } from 'vitest';
import { resolveAvailableNodePort } from './node-port-allocate';

describe('resolveAvailableNodePort', () => {
  it('returns preferred port when free', () => {
    expect(resolveAvailableNodePort(30080, new Set())).toBe(30080);
  });

  it('picks next free port when preferred is taken', () => {
    expect(resolveAvailableNodePort(30080, new Set([30080]))).toBe(30081);
  });

  it('skips multiple occupied ports', () => {
    expect(resolveAvailableNodePort(30080, new Set([30080, 30081, 30082]))).toBe(30083);
  });
});
