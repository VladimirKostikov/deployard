import { describe, expect, it } from 'vitest';
import { parseCookieHeader } from './parse-cookie-header';

describe('parseCookieHeader', () => {
  it('parses cookie pairs from header', () => {
    expect(parseCookieHeader('access_token=abc123; theme=dark')).toEqual({
      access_token: 'abc123',
      theme: 'dark',
    });
  });

  it('returns empty object for missing header', () => {
    expect(parseCookieHeader(undefined)).toEqual({});
  });
});
