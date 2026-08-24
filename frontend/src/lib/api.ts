import type { AuthUser } from '../context/auth-context';
import type { Campaign, CampaignAsset, CampaignMetricsSummary, CampaignTimeseriesPoint, ConnectablePlatform, DashboardSummary, PlatformBreakdownPoint, PlatformConnection, TimeseriesPoint } from './types';

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
    // Laravel validasyon hatası: {message, errors: {alan: [mesaj, ...]}} - alana özel
    // mesaj varsa (ör. bütçe limiti aşıldı) genel "geçersiz veri" mesajı yerine onu göster.
    const firstFieldError = body?.errors ? (Object.values(body.errors)[0] as string[] | undefined)?.[0] : undefined;
    throw new Error(firstFieldError || body?.message || `API Hatası: ${response.status} ${response.statusText}`);
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
  update: (data: Partial<Pick<AuthUser, 'name' | 'email' | 'daily_budget_limit'>>) =>
    fetchAPI<AuthUser>('/user', { method: 'PATCH', body: JSON.stringify(data) }),
  googleLoginUrl: () => `${API_URL}/auth/google/redirect`,
};

// Kampanya İstekleri
export const campaignsApi = {
  list: () => fetchAPI<Campaign[]>('/campaigns'),
  get: (id: string) => fetchAPI<Campaign>(`/campaigns/${id}`),
  approve: (id: string, selectedCopyIndex: number, selectedImageIndex: number) => fetchAPI<{ data: Campaign }>(`/campaigns/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ selected_copy_index: selectedCopyIndex, selected_image_index: selectedImageIndex }),
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

// Kullanıcının kendi Google Ads / Meta hesabını bağlaması
export const integrationsApi = {
  list: () => fetchAPI<PlatformConnection[]>('/integrations'),
  redirect: (platform: ConnectablePlatform) => fetchAPI<{ url: string }>(`/integrations/${platform}/redirect`),
  disconnect: (platform: ConnectablePlatform) => fetchAPI<{ message: string }>(`/integrations/${platform}`, { method: 'DELETE' }),
};

// İstatistik İstekleri
export const metricsApi = {
  summary: () => fetchAPI<DashboardSummary>('/metrics/summary'),
  timeseries: () => fetchAPI<TimeseriesPoint[]>('/metrics/timeseries'),
  byPlatform: () => fetchAPI<PlatformBreakdownPoint[]>('/metrics/platform'),
  campaignSummary: (id: string) => fetchAPI<CampaignMetricsSummary>(`/campaigns/${id}/metrics/summary`),
  campaignTimeseries: (id: string) => fetchAPI<CampaignTimeseriesPoint[]>(`/campaigns/${id}/metrics/timeseries`),
};
