import type { LucideIcon } from 'lucide-react';

export function StripStat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <div className="p-5 flex items-center gap-3.5 min-w-0">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
        <Icon size={17} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-400 truncate">{label}</p>
        <p className="text-lg font-semibold text-ink-100 tabular-nums truncate">{value}</p>
        {hint && <p className="text-[11px] text-ink-400/70 truncate">{hint}</p>}
      </div>
    </div>
  );
}
