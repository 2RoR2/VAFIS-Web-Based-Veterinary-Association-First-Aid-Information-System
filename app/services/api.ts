const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);

const buildUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

export const apiGet = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(buildUrl(path), { signal });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const apiPost = async <T>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};
