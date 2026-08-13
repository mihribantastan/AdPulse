export type Platform = 'google_ads' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x';

export const PLATFORM_LABELS: Record<Platform, string> = {
  google_ads: 'Google Ads',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
};

// Grafiklerde kategori (platform) rengi olarak kullanılır - PlatformBadge'in marka
// renklerinden farklıdır çünkü tek başına renk-körü ayrımı (CVD) geçen, doğrulanmış
// sabit sıralı bir palet gerekiyor. Rozet ikonlarıyla birlikte (renk tek başına değil) kullanılır.
export const PLATFORM_CHART_COLORS: Record<Platform, { light: string; dark: string }> = {
  google_ads: { light: '#2a78d6', dark: '#3987e5' },
  instagram: { light: '#eb6834', dark: '#d95926' },
  facebook: { light: '#1baf7a', dark: '#199e70' },
  youtube: { light: '#eda100', dark: '#c98500' },
  tiktok: { light: '#e87ba4', dark: '#d55181' },
  x: { light: '#008300', dark: '#008300' },
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type BrandTone = 'profesyonel' | 'samimi' | 'eglenceli' | 'lux' | 'enerjik';

export const BRAND_TONE_LABELS: Record<BrandTone, string> = {
  profesyonel: 'Profesyonel / Güven Verici',
  samimi: 'Samimi / Sıcak',
  eglenceli: 'Eğlenceli / Esprili',
  lux: 'Lüks / Prestijli',
  enerjik: 'Enerjik / Gençlere Hitap Eden',
};

export type CampaignGoal = 'brand_awareness' | 'conversions' | 'traffic' | 'lead_generation' | 'app_installs';

export const CAMPAIGN_GOAL_LABELS: Record<CampaignGoal, string> = {
  brand_awareness: 'Marka Bilinirliği',
  conversions: 'Satış / Dönüşüm',
  traffic: 'Web Sitesi Trafiği',
  lead_generation: 'Potansiyel Müşteri Toplama',
  app_installs: 'Uygulama İndirme',
};

export type CtaPreference = 'buy_now' | 'learn_more' | 'try_free' | 'sign_up' | 'contact_us';

export const CTA_LABELS: Record<CtaPreference, string> = {
  buy_now: 'Şimdi Satın Al',
  learn_more: 'Daha Fazla Bilgi',
  try_free: 'Ücretsiz Dene',
  sign_up: 'Kayıt Ol',
  contact_us: 'İletişime Geç',
};

export type Creative = {
  target_audience: string;
  ad_copy: string;
  image_prompt?: string;
  generated_image_url?: string | null;
};

export type AiAnalysisResults = {
  strategy_brief?: string;
  creatives?: Creative[];
};

export type CampaignAsset = {
  id: number;
  type: 'image' | 'video';
  url: string;
  original_name?: string | null;
};

export type Campaign = {
  id: string;
  created_at: string;
  target_url_or_product: string;
  target_audience?: string | null;
  key_features?: string | null;
  brand_tone?: string | null;
  extra_notes?: string | null;
  campaign_goal?: string | null;
  cta_preference?: string | null;
  platforms: Platform[];
  daily_budget: number;
  approval_status: ApprovalStatus;
  ai_analysis_results?: AiAnalysisResults | null;
  selected_creative_index?: number | null;
  assets?: CampaignAsset[];
};

export type PipelinePlatformCount = { platform: string; count: number };

export type PipelineStats = {
  total_campaigns: number;
  pending: number;
  approved: number;
  rejected: number;
  total_daily_budget: number;
  platform_distribution: PipelinePlatformCount[];
};

export type DashboardSummary = {
  clicks: number;
  spend: number;
  profit: number;
  ctr: number;
  has_performance_data: boolean;
  pipeline: PipelineStats;
};

export type TimeseriesPoint = { date: string; clicks: number; spend: number };
export type PlatformBreakdownPoint = { platform: string; clicks: number; spend: number };