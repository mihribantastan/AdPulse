import type { Platform } from '../lib/types';
import { PLATFORM_LABELS } from '../lib/types';

export function PlatformBadge({ platform, size = 'md' }: { platform: Platform; size?: 'sm' | 'md' }) {
  return (
    <span className={`font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {PLATFORM_LABELS[platform]}
    </span>
  );
}