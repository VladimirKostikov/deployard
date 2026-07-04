import { describe, expect, it } from 'vitest';
import { rewriteComposeServiceReferenceValue } from './compose-service-host-refs';

describe('rewriteComposeServiceReferenceValue', () => {
  it('rewrites in-cluster service hostnames', () => {
    const value = rewriteComposeServiceReferenceValue(
      'http://catalog-svc:3000',
      ['catalog-svc'],
      () => 'order-hub-catalog-svc',
    );

    expect(value).toBe('http://order-hub-catalog-svc:3000');
  });
});
