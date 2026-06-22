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

async function parseError(res: Response): Promise<string> {
  const status = res.status;
  try {
    const data = await res.json();
    if (data.error) return data.error;
    if (data.message) return data.message;
  } catch {
    // Not JSON response
  }
  try {
    const text = await res.text();
    if (text) return `[HTTP ${status}] ${text.slice(0, 200)}`;
  } catch {
    // Cannot read body
  }
  if (status === 404) return '接口未找到 (404) — 后端服务可能未启动';
  if (status === 401) return '未登录或登录已过期 (401)';
  if (status === 403) return '权限不足 (403)';
  if (status === 500) return '服务器内部错误 (500)';
  if (status === 502) return '网关错误 (502) — 后端服务可能未启动';
  if (status === 503) return '服务不可用 (503)';
  return `请求失败 (HTTP ${status})`;
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

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers, credentials: 'include' });
  } catch (err: any) {
    throw new Error(
      err.name === 'TypeError' && /failed to fetch/i.test(err.message)
        ? '网络连接失败 — 请检查后端服务是否启动'
        : `网络错误: ${err.message || err}`
    );
  }

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      try {
        res = await fetch(url, { ...options, headers, credentials: 'include' });
      } catch (err: any) {
        throw new Error(`重试失败: ${err.message || err}`);
      }
    }
  }

  if (!res.ok) {
    const errMsg = await parseError(res);
    throw new Error(errMsg);
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
