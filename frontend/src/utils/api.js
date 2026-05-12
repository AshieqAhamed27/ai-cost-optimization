const LOCAL_API_URL = 'http://localhost:5001/api';
const PRODUCTION_API_URL = 'https://ai-cost-optimization.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalApiUrl = configuredApiUrl?.includes('localhost') || configuredApiUrl?.includes('127.0.0.1');

const API_URL =
  configuredApiUrl && (import.meta.env.DEV || !isLocalApiUrl)
    ? configuredApiUrl
    : import.meta.env.DEV
      ? LOCAL_API_URL
      : PRODUCTION_API_URL;

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

export const planNames = {
  trial: '7-Day Trial',
  mini_audit: 'Mini Audit',
  business_audit: 'Business Audit',
  monthly_monitor: 'Monthly Monitor'
};

export const isTrialActive = (user = getUser()) =>
  user?.planStatus === 'trial' &&
  user?.activePlan === 'trial' &&
  user?.trialEndsAt &&
  new Date(user.trialEndsAt).getTime() > Date.now();

export const hasActivePlan = (user = getUser()) =>
  (user?.planStatus === 'active' && user?.activePlan && user.activePlan !== 'free') ||
  isTrialActive(user);

export const getTrialDaysLeft = (user = getUser()) => {
  if (!isTrialActive(user)) return 0;

  const msLeft = new Date(user.trialEndsAt).getTime() - Date.now();
  return Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
};

export const getPlanName = (planId) => planNames[planId] || 'Choose Plan';

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
