import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ChevronDown, LogOut, Settings, WifiOff, User as UserIcon, Moon, Sun } from 'lucide-react';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, demo, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mb-6 transition-colors duration-300">

      {/* Sol Kısım: Başlık */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>

      {/* Sağ Kısım: Kontroller */}
      <div className="flex items-center gap-3">

        {demo && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-200 dark:border-amber-500/20">
            <WifiOff size={13} />
            Demo Veri
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
              {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {user?.name ?? 'Kullanıcı'}
            </span>
            <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg p-1.5 z-50">

              <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name ?? 'Admin Hesabı'}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs truncate mt-0.5">{user?.email ?? 'admin@adpulse.com'}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => { setOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <UserIcon size={15} /> Profilim
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Settings size={15} /> Ayarlar
                </button>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={15} /> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
