import type { LucideIcon } from 'lucide-react';

export function EmptyChartState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-2 px-6">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-1">
        <Icon size={18} strokeWidth={2} />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">{hint}</p>
    </div>
  );
}
