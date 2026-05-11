const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const getToken = () => localStorage.getItem('ai_cost_token') || '';

export const setSession = ({ token, user }) => {
  if (token) localStorage.setItem('ai_cost_token', token);
  if (user) localStorage.setItem('ai_cost_user', JSON.stringify(user));
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ai_cost_user') || 'null');
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('ai_cost_token');
  localStorage.removeItem('ai_cost_user');
};

export const isLoggedIn = () => Boolean(getToken());

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const formatCurrency = (value) =>
  `Rs ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;

