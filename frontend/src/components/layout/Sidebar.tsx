import { NavLink } from 'react-router-dom';
import { Megaphone, BarChart3, FileText, Bot, PlusCircle, Settings, Sparkles } from 'lucide-react';

const links = [
  { to: '/app/statistics', label: 'Overview', icon: BarChart3 },
  { to: '/app/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/app/campaigns/new', label: 'Create', icon: PlusCircle },
  { to: '/app/reports', label: 'Reports', icon: FileText },
  { to: '/app/chatbot', label: 'AI Agent', icon: Bot },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-[calc(100vh-2.5rem)] my-5 mx-5 flex flex-col">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-4 mb-4">
        <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center mr-3">
          <Sparkles size={16} />
        </div>
        <span className="text-lg font-medium tracking-tight text-frankie-text">AdPulse</span>
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 space-y-1 px-2">
        <div className="px-2 pb-4 text-xs font-semibold tracking-wider text-frankie-muted uppercase">
          Menu
        </div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-frankie-hover text-frankie-text'
                  : 'text-frankie-muted hover:text-frankie-text hover:bg-frankie-hover/50'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Ayarlar */}
      <div className="p-2 mb-2">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-frankie-hover text-frankie-text'
                : 'text-frankie-muted hover:text-frankie-text hover:bg-frankie-hover/50'
            }`
          }
        >
          <Settings size={18} strokeWidth={1.5} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}