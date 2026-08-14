import type { IconType } from 'react-icons';
import { SiGoogleads, SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX } from 'react-icons/si';
import type { Platform } from '../lib/types';
import { PLATFORM_LABELS } from '../lib/types';

const PLATFORM_STYLES: Record<Platform, { bg: string; icon: IconType; iconColor: string }> = {
  google_ads: { bg: 'bg-white dark:bg-slate-800', icon: SiGoogleads, iconColor: 'text-[#4285F4]' },
  instagram: { bg: 'bg-white dark:bg-slate-800', icon: SiInstagram, iconColor: 'text-[#E4405F]' },
  facebook: { bg: 'bg-white dark:bg-slate-800', icon: SiFacebook, iconColor: 'text-[#0866FF]' },
  youtube: { bg: 'bg-white dark:bg-slate-800', icon: SiYoutube, iconColor: 'text-[#FF0000]' },
  tiktok: { bg: 'bg-white dark:bg-slate-800', icon: SiTiktok, iconColor: 'text-slate-900 dark:text-white' },
  x: { bg: 'bg-white dark:bg-slate-800', icon: SiX, iconColor: 'text-slate-900 dark:text-white' },
};

export function PlatformBadge({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) {
  const style = PLATFORM_STYLES[platform];
  const dimension = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 11 : 16;

  if (!style) {
    return (
      <span
        title={platform}
        className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 bg-slate-400 text-white text-[9px] ${dimension}`}
      >
        ?
      </span>
    );
  }

  const Icon = style.icon;
  return (
    <span
      title={PLATFORM_LABELS[platform] ?? platform}
      className={`inline-flex items-center justify-center rounded-full shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm ${dimension} ${style.bg}`}
    >
      <Icon size={iconSize} className={style.iconColor} />
    </span>
  );
}
