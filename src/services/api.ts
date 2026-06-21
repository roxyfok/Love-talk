const API_BASE = import.meta.env.VITE_API_URL || '';

function getAccessToken(): string | null {
  return localStorage.getItem('lt_access_token');
}

function setAccessToken(token: string) {
  localStorage.setItem('lt_access_token', token);
}

function clearAccessToken() {
  localStorage.removeItem('lt_access_token');
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => refreshQueue.push(resolve));
  }
  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    setAccessToken(data.accessToken);
    refreshQueue.forEach((cb) => cb(data.accessToken));
    refreshQueue = [];
    return data.accessToken;
  } catch {
    clearAccessToken();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
    window.dispatchEvent(new Event('auth:logout'));
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers, credentials: 'include' });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(url, { ...options, headers, credentials: 'include' });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }
      return retryRes.json();
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body: any) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(path: string, body: any) => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};

export const authApi = {
  register: (email: string, password: string) =>
    api.post<{ user: { id: string; email: string; created_at: string }; accessToken: string }>('/api/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post<{ user: { id: string; email: string; created_at: string }; accessToken: string }>('/api/auth/login', { email, password }),
  me: () => api.get<{ user: { id: string; email: string; created_at: string } }>('/api/auth/me'),
  refresh: () => api.post<{ accessToken: string }>('/api/auth/refresh', {}),
  logout: () => api.post('/api/auth/logout', {}),
  setToken: setAccessToken,
  clearToken: clearAccessToken,
  getToken: getAccessToken,
};

export const contactsApi = {
  getAll: () => api.get<{ contacts: any[] }>('/api/contacts'),
  create: (data: any) => api.post<{ contact: any }>('/api/contacts', data),
  update: (id: string, data: any) => api.put<{ contact: any }>(`/api/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/api/contacts/${id}`),
};

export { getAccessToken, setAccessToken, clearAccessToken };
