const API_BASE = (process.env.NEXT_PUBLIC_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://hapkido-backend.vercel.app/api'
    : 'http://localhost:5000/api'
)).replace(/\/+$/, '');

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hapkido_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('hapkido_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hapkido_token');
    localStorage.removeItem('hapkido_user');
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('hapkido_user');
  return userStr ? JSON.parse(userStr) : null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ success: false, message: 'Gagal memproses respon server.' }));

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      removeAuthToken();
      window.location.href = '/login';
    }
  }

  return data;
}
