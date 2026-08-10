import type { Campaign, CampaignAsset, DashboardSummary, PlatformBreakdownPoint, TimeseriesPoint } from './types';

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
    const response = await fetch(`${API_URL}/campaigns/${id}/assets`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<{ data: CampaignAsset[] }>;
  },
};

// İstatistik İstekleri
export const metricsApi = {
  summary: () => fetchAPI<DashboardSummary>('/metrics/summary'),
  timeseries: () => fetchAPI<TimeseriesPoint[]>('/metrics/timeseries'),
  byPlatform: () => fetchAPI<PlatformBreakdownPoint[]>('/metrics/platform'),
};