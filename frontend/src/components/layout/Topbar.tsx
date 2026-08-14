import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ChevronDown, LogOut, Settings, User as UserIcon, Plus } from 'lucide-react';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="relative z-20 h-16 flex items-center justify-between px-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl mb-6">

      {/* Sol Kısım: Başlık */}
      <div>
        <h1 className="font-display text-lg tracking-tight text-ink-100">
          {title}
        </h1>
        {subtitle && <p className="text-ink-400 text-sm mt-0.5">{subtitle}</p>}
      </div>

      {/* Sağ Kısım: Kontroller */}
      <div className="flex items-center gap-3">

        <button
          onClick={() => navigate('/app/campaigns/new')}
          className="flex items-center gap-1.5 bg-accent-500 text-ink-950 pl-3 pr-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors shadow-[0_0_16px_rgba(51,194,232,0.25)]"
        >
          <Plus size={16} strokeWidth={2.5} /> Yeni Kampanya
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-colors"
          >
            <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-xs font-semibold text-ink-950">
              {user?.name?.slice(0, 2).toUpperCase() ?? 'AD'}
            </div>
            <span className="text-sm font-medium text-ink-100">
              {user?.name ?? 'Kullanıcı'}
            </span>
            <ChevronDown size={15} className={`text-ink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-ink-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl shadow-black/40 p-1.5 z-50">

              <div className="px-3 py-3 border-b border-white/10 mb-1">
                <p className="text-sm font-semibold text-ink-100 truncate">{user?.name ?? 'Admin Hesabı'}</p>
                <p className="text-ink-400 text-xs truncate mt-0.5">{user?.email ?? 'admin@adpulse.com'}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => { setOpen(false); navigate('/app/profile'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-400 hover:bg-white/[0.05] hover:text-ink-100 transition-colors"
                >
                  <UserIcon size={15} /> Profilim
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-400 hover:bg-white/[0.05] hover:text-ink-100 transition-colors"
                >
                  <Settings size={15} /> Ayarlar
                </button>

                <div className="h-px w-full bg-white/10 my-1"></div>

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
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
