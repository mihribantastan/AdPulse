import type { IconType } from 'react-icons';
import { SiGoogleads, SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX } from 'react-icons/si';
import type { Platform } from '../lib/types';
import { PLATFORM_LABELS } from '../lib/types';

const PLATFORM_STYLES: Record<Platform, { icon: IconType; iconColor: string }> = {
  google_ads: { icon: SiGoogleads, iconColor: 'text-[#4285F4]' },
  instagram: { icon: SiInstagram, iconColor: 'text-[#E4405F]' },
  facebook: { icon: SiFacebook, iconColor: 'text-[#0866FF]' },
  youtube: { icon: SiYoutube, iconColor: 'text-[#FF0000]' },
  tiktok: { icon: SiTiktok, iconColor: 'text-ink-100' },
  x: { icon: SiX, iconColor: 'text-ink-100' },
};

export function PlatformBadge({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) {
  const style = PLATFORM_STYLES[platform];
  const dimension = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 11 : 16;

  if (!style) {
    return (
      <span
        title={platform}
        className={`inline-flex items-center justify-center rounded-full font-semibold shrink-0 bg-ink-800 text-ink-100 text-[9px] ${dimension}`}
      >
        ?
      </span>
    );
  }

  const Icon = style.icon;
  return (
    <span
      title={PLATFORM_LABELS[platform] ?? platform}
      className={`inline-flex items-center justify-center rounded-full shrink-0 border border-ink-700 bg-ink-800 ${dimension}`}
    >
      <Icon size={iconSize} className={style.iconColor} />
    </span>
  );
}
