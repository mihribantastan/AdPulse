import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  positive?: boolean;
};

export function StatCard({ label, value, delta, icon: Icon, positive = true }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between mb-5">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Icon size={18} strokeWidth={2} />
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-md ${
            positive
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
          }`}
        >
          {delta}
        </span>
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
