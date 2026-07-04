const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api';

let sessionCookie = process.env.TEST_SESSION_COOKIE ?? '';

export function resetSession() {
  sessionCookie = '';
}

export async function loginAsAdmin() {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_ADMIN_EMAIL ?? 'admin@dpd.local',
      password: process.env.TEST_ADMIN_PASSWORD ?? 'Admin123!',
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const cookie = response.headers.get('set-cookie');
  if (cookie) {
    sessionCookie = cookie.split(';')[0];
  }
}

export async function loginAsUser() {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_USER_EMAIL ?? 'user@dpd.local',
      password: process.env.TEST_USER_PASSWORD ?? 'User123!',
    }),
  });

  if (!response.ok) {
    throw new Error(`User login failed: ${response.status}`);
  }

  const cookie = response.headers.get('set-cookie');
  if (cookie) {
    sessionCookie = cookie.split(';')[0];
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!sessionCookie) {
    await loginAsAdmin();
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}

export async function apiFetchStatus(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiFetchUnauthenticated(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

export function getSessionCookie() {
  return sessionCookie;
}
