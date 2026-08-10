import type { Campaign, DashboardSummary, PlatformBreakdownPoint, TimeseriesPoint } from './types';

// .env dosyasındaki adresi çeker
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Genel bir fetch yardımcısı (Hata yönetimi ve JSON dönüşümü için)
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Kampanya İstekleri
export const campaignsApi = {
  list: () => fetchAPI<Campaign[]>('/campaigns'),
  get: (id: string) => fetchAPI<Campaign>(`/campaigns/${id}`),
  create: (data: Partial<Campaign>) => fetchAPI<Campaign>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// İstatistik İstekleri
export const metricsApi = {
  summary: () => fetchAPI<DashboardSummary>('/metrics/summary'),
  timeseries: () => fetchAPI<TimeseriesPoint[]>('/metrics/timeseries'),
  byPlatform: () => fetchAPI<PlatformBreakdownPoint[]>('/metrics/platform'),
};