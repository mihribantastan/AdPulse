import type { AuthUser } from '../context/auth-context';
import type { Campaign, CampaignAsset, CampaignMetricsSummary, CampaignTimeseriesPoint, DashboardSummary, PlatformBreakdownPoint, TimeseriesPoint } from './types';

// .env dosyasındaki adresi çeker
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'adpulse_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Genel bir fetch yardımcısı (Hata yönetimi, JSON dönüşümü ve token ekleme için)
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `API Hatası: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Kimlik Doğrulama
export const authApi = {
  register: (name: string, email: string, password: string, passwordConfirmation: string) =>
    fetchAPI<{ user: AuthUser; token: string }>('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
    }),
  login: (email: string, password: string) =>
    fetchAPI<{ user: AuthUser; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => fetchAPI<{ message: string }>('/logout', { method: 'POST' }),
  me: () => fetchAPI<AuthUser>('/user'),
  googleLoginUrl: () => `${API_URL}/auth/google/redirect`,
};

// Kampanya İstekleri
export const campaignsApi = {
  list: () => fetchAPI<Campaign[]>('/campaigns'),
  get: (id: string) => fetchAPI<Campaign>(`/campaigns/${id}`),
  approve: (id: string, selectedCreativeIndex: number) => fetchAPI<{ data: Campaign }>(`/campaigns/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ selected_creative_index: selectedCreativeIndex }),
  }),
  create: (data: Partial<Campaign>) => fetchAPI<{ message: string; data: Campaign }>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  // Content-Type'ı elle vermiyoruz: multipart/form-data sınırını (boundary) tarayıcı kendi ekler.
  uploadAssets: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files[]', file));
    const token = getToken();
    const response = await fetch(`${API_URL}/campaigns/${id}/assets`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<{ data: CampaignAsset[] }>;
  },
  // Kampanya oluşturulduktan (ve varsa görseller yüklendikten) sonra ajan zincirini başlatır
  start: (id: string) => fetchAPI<{ message: string }>(`/campaigns/${id}/start`, { method: 'POST' }),
};

// İstatistik İstekleri
export const metricsApi = {
  summary: () => fetchAPI<DashboardSummary>('/metrics/summary'),
  timeseries: () => fetchAPI<TimeseriesPoint[]>('/metrics/timeseries'),
  byPlatform: () => fetchAPI<PlatformBreakdownPoint[]>('/metrics/platform'),
  campaignSummary: (id: string) => fetchAPI<CampaignMetricsSummary>(`/campaigns/${id}/metrics/summary`),
  campaignTimeseries: (id: string) => fetchAPI<CampaignTimeseriesPoint[]>(`/campaigns/${id}/metrics/timeseries`),
};
