import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon: LucideIcon;
  positive?: boolean;
};

export function StatCard({ label, value, delta, hint, icon: Icon, positive = true }: StatCardProps) {
  return (
    <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-5 transition-colors hover:border-glass/20 hover:bg-glass/[0.05]">
      <div className="flex items-center justify-between mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
          <Icon size={18} strokeWidth={2} />
        </div>
        {delta && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md ${
              positive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-ink-400 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-ink-100 tracking-tight tabular-nums">{value}</p>
        {hint && <p className="text-xs text-ink-400/70 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
