import { describe, expect, it } from 'vitest';
import { isNodePortConflict } from './is-node-port-conflict';

describe('isNodePortConflict', () => {
  it('detects already allocated nodePort errors', () => {
    expect(
      isNodePortConflict({
        code: 422,
        message:
          'Service "web" is invalid: spec.ports[0].nodePort: Invalid value: 30085: provided port is already allocated',
      }),
    ).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(
      isNodePortConflict({
        code: 404,
        message: 'services "web" not found',
      }),
    ).toBe(false);
  });
});
