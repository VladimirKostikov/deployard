import { describe, expect, it } from 'vitest';
import type { AuthUser } from '@dpd/shared';
import {
  apiFetch,
  apiFetchStatus,
  apiFetchUnauthenticated,
  getSessionCookie,
  loginAsAdmin,
  loginAsUser,
  resetSession,
} from './api-client';

describe('Auth API', () => {
  it('POST /auth/login sets session and GET /auth/me returns user', async () => {
    resetSession();
    await loginAsAdmin();
    const user = await apiFetch<AuthUser>('/auth/me');

    expect(user.email).toBe('admin@dpd.local');
    expect(user.roles).toContain('admin');
  });

  it('GET /auth/me returns 401 without session', async () => {
    const response = await apiFetchUnauthenticated('/auth/me');
    expect(response.status).toBe(401);
  });

  it('POST /auth/logout revokes session cookie', async () => {
    resetSession();
    await loginAsAdmin();
    const cookie = getSessionCookie();

    const logoutResponse = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:3000/api'}/auth/logout`,
      {
        method: 'POST',
        headers: { Cookie: cookie },
      },
    );
    expect(logoutResponse.ok).toBe(true);

    const meResponse = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:3000/api'}/auth/me`,
      { headers: { Cookie: cookie } },
    );
    expect(meResponse.status).toBe(401);
  });

  it('demo user cannot access admin routes', async () => {
    resetSession();
    await loginAsUser();

    const response = await apiFetchStatus('/admin/users');
    expect(response.status).toBe(403);
  });
});
