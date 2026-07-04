import { describe, expect, it } from 'vitest';
import { isHostMappedNodePort, resolveLocalKindNodePort } from '@dpd/shared';

describe('local-kind-node-port', () => {
  it('maps web container port to 30081', () => {
    expect(resolveLocalKindNodePort(80)).toBe(30081);
  });

  it('maps api container port to 30080', () => {
    expect(resolveLocalKindNodePort(3000)).toBe(30080);
  });

  it('detects host-mapped node ports', () => {
    expect(isHostMappedNodePort(30081)).toBe(true);
    expect(isHostMappedNodePort(32382)).toBe(false);
  });
});
