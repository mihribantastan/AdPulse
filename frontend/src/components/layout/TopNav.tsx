import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const links = [
  { to: '/app/statistics', label: 'Genel Bakış' },
  { to: '/app/campaigns', label: 'Kampanyalar' },
  { to: '/app/reports', label: 'Raporlar' },
];

const pillClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
    isActive
      ? 'bg-ink-100 text-ink-950'
      : 'text-ink-400 hover:text-ink-100'
  }`;

export function TopNav() {
  return (
    <nav className="h-16 flex items-center justify-between gap-6 px-1 mb-3">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
          <Sparkles size={16} className="text-ink-950" />
        </div>
        <span className="font-display text-base tracking-tight text-ink-100">AdPulse</span>
      </div>

      <div className="flex items-center gap-1 bg-white/[0.04] rounded-full p-1">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} className={pillClass}>
            {label}
          </NavLink>
        ))}
      </div>

      <div className="w-24 shrink-0 hidden lg:block" />
    </nav>
  );
}
