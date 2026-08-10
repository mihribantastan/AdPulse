export type Platform = 'google_ads' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x';

export const PLATFORM_LABELS: Record<Platform, string> = {
  google_ads: 'Google Ads',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
};

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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

export type Campaign = {
  id: string;
  target_url_or_product: string;
  target_audience?: string | null;
  platforms: Platform[];
  daily_budget: number;
  approval_status: ApprovalStatus;
  ai_analysis_results?: AiAnalysisResults | null;
};

export type DashboardSummary = {
  clicks: number;
  spend: number;
  profit: number;
  ctr: number;
};

export type TimeseriesPoint = { date: string; value: number };
export type PlatformBreakdownPoint = { platform: string; percentage: number };