import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, LogOut, Settings, WifiOff, User as UserIcon, Moon, Sun } from 'lucide-react';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, demo, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Tema Değiştirici State'i
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Tıklama dışı menü kapatma mantığı
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/60 dark:bg-[#0A101D]/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[2rem] z-20 shadow-sm transition-colors duration-500 mb-6">
      
      {/* Sol Kısım: Başlık */}
      <div>
        <h1 className="text-2xl font-black capitalize tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-blue-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
          {title}
        </h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 ml-6">{subtitle}</p>}
      </div>

      {/* Sağ Kısım: Kontroller */}
      <div className="flex items-center gap-4">
        
        {/* Demo Veri Uyarı Rozeti */}
        {demo && (
          <span className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">
            <WifiOff size={14} />
            Demo Veri
          </span>
        )}

        {/* Tema Değiştirme Düğmesi */}
        <button 
          onClick={toggleTheme} 
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Kullanıcı Profili ve Açılır Menü */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-3 bg-white/80 dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 pl-2 pr-4 py-1.5 rounded-full hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-violet-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              {user?.name ?? 'Kullanıcı'}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Fütüristik Açılır Menü (Dropdown) */}
          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-[#0A101D]/95 backdrop-blur-3xl rounded-[2rem] border border-slate-200 dark:border-slate-700/80 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(34,211,238,0.1)] z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              
              <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.name ?? 'Admin Hesabı'}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate mt-0.5">{user?.email ?? 'admin@adpulse.com'}</p>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => { setOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131B2C] hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <UserIcon size={16} /> Profilim
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131B2C] hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Settings size={16} /> Ayarlar
                </button>
                
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>
                
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={16} /> Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}