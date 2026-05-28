const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

export const apiGet = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(buildUrl(path), { signal, credentials: 'include' });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiPut = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiDelete = async <T>(path: string): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(errBody?.error ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

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
