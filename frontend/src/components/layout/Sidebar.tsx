import { NavLink } from 'react-router-dom';
import { Megaphone, BarChart3, FileText, Bot, PlusCircle, Settings, Sparkles } from 'lucide-react';

const links = [
  { to: '/app/statistics', label: 'Genel Bakış', icon: BarChart3 },
  { to: '/app/campaigns', label: 'Kampanyalar', icon: Megaphone },
  { to: '/app/campaigns/new', label: 'Yeni Oluştur', icon: PlusCircle },
  { to: '/app/reports', label: 'Ağ Raporları', icon: FileText },
  { to: '/app/chatbot', label: 'AI Asistan', icon: Bot },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
  }`;

export function Sidebar() {
  return (
    <aside className="w-64 h-[calc(100vh-2.5rem)] my-5 ml-5 mr-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-colors duration-300">

      {/* Logo */}
      <div className="h-14 flex items-center px-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">AdPulse</span>
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 space-y-1 px-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-600 uppercase">
          Menü
        </div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Ayarlar */}
      <div className="px-1 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
        <NavLink to="/app/settings" className={navLinkClass}>
          <Settings size={17} strokeWidth={2} />
          Ayarlar
        </NavLink>
      </div>
    </aside>
  );
}
