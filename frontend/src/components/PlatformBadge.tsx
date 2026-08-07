import type { Platform } from '../lib/types';
import { PLATFORM_LABELS } from '../lib/types';

const PLATFORM_STYLES: Record<Platform, { bg: string; text: string; code: string }> = {
  google_ads: { bg: 'bg-blue-600', text: 'text-white', code: 'G' },
  instagram: { bg: 'bg-pink-600', text: 'text-white', code: 'IG' },
  facebook: { bg: 'bg-blue-700', text: 'text-white', code: 'f' },
  youtube: { bg: 'bg-red-600', text: 'text-white', code: '▶' },
  tiktok: { bg: 'bg-slate-900 dark:bg-white', text: 'text-white dark:text-slate-900', code: 'TT' },
  x: { bg: 'bg-slate-900 dark:bg-white', text: 'text-white dark:text-slate-900', code: 'X' },
};

export function PlatformBadge({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) {
  const style = PLATFORM_STYLES[platform];
  const dimension = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-8 h-8 text-xs';

  return (
    <span
      title={PLATFORM_LABELS[platform]}
      className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 ${dimension} ${style.bg} ${style.text}`}
    >
      {style.code}
    </span>
  );
}
