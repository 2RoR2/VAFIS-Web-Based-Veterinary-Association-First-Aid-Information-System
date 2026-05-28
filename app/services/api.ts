const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

// ── Session-expired callback ───────────────────────────────────────────────────
// App.tsx registers this so the API layer can clear React state when both
// the access token AND refresh token are expired (true session end).

let _onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  _onSessionExpired = handler;
};

// ── Token refresh — de-duplicated ─────────────────────────────────────────────
// If multiple concurrent requests all get a 401 at the same time, we only
// call /auth/refresh once and share the result across all of them.

let _refreshing: Promise<boolean> | null = null;

const attemptTokenRefresh = (): Promise<boolean> => {
  if (_refreshing) return _refreshing;

  _refreshing = fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    credentials: 'include',
  })
    .then((res) => {
      if (!res.ok) throw new Error('refresh failed');
      return true;
    })
    .catch(() => {
      // Both tokens expired — notify App to clear the session
      _onSessionExpired?.();
      return false;
    })
    .finally(() => {
      _refreshing = null;
    });

  return _refreshing;
};

// Paths where a 401 should NOT trigger an auto-refresh attempt
// (login / signup / logout / refresh itself — these are auth actions, not resource calls)
const SKIP_REFRESH_PATHS = ['/auth/login', '/auth/signup', '/auth/logout', '/auth/refresh'];
const shouldSkipRefresh = (path: string) =>
  SKIP_REFRESH_PATHS.some((p) => path.includes(p));

// ── Base fetch with auto-refresh ──────────────────────────────────────────────

const fetchWithRefresh = async (
  path: string,
  init: RequestInit,
): Promise<Response> => {
  const response = await fetch(buildUrl(path), init);

  // If 401 and this isn't an auth-action endpoint, try refreshing once
  if (response.status === 401 && !shouldSkipRefresh(path)) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // New access-token cookie is now set — retry the original request
      return fetch(buildUrl(path), init);
    }
    // Refresh failed — return the original 401 so callers can handle it
  }

  return response;
};

// ── Public API helpers ────────────────────────────────────────────────────────

export const apiGet = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetchWithRefresh(path, { signal, credentials: 'include' });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  };

  const response = await fetchWithRefresh(path, init);

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  const init: RequestInit = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  };

  const response = await fetchWithRefresh(path, init);

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiDelete = async <T>(path: string): Promise<T> => {
  const response = await fetchWithRefresh(path, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

// ── Auth-specific helpers ─────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: 'pet-owner' | 'veterinary-professional' | 'administrator';
}

export interface AuthResponse {
  user: SessionUser;
}

export const authLogin = (email: string, password: string) =>
  apiPost<AuthResponse>('/auth/login', { email, password });

export const authSignup = (fullName: string, email: string, password: string) =>
  apiPost<AuthResponse>('/auth/signup', { fullName, email, password });

export const authMe = async (): Promise<SessionUser | null> => {
  try {
    const data = await apiGet<AuthResponse>('/auth/me');
    return data.user;
  } catch {
    return null;
  }
};

export const authRefresh = async (): Promise<SessionUser | null> => {
  try {
    const data = await apiPost<AuthResponse>('/auth/refresh', {});
    return data.user;
  } catch {
    return null;
  }
};

export const authLogout = () => apiPost<{ message: string }>('/auth/logout', {});
