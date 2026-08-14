import type { LucideIcon } from 'lucide-react';

export function EmptyChartState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-2 px-6">
      <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-ink-400 mb-1">
        <Icon size={18} strokeWidth={2} />
      </div>
      <p className="text-sm font-medium text-ink-100">{title}</p>
      <p className="text-xs text-ink-400 max-w-xs">{hint}</p>
    </div>
  );
}
