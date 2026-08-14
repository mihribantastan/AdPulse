import { Mail, User as UserIcon, Save, Hash } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/useAuth';

const inputClass = 'w-full bg-white/[0.03] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors text-ink-100';

export function Profile() {
  const { user } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <AppLayout title="Profilim" subtitle="Kimliğiniz ve hesap bilgileriniz.">
      <div className="max-w-3xl mx-auto space-y-4 pb-10">

        {/* Kimlik başlığı */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 flex items-center gap-6">
          <div
            className="pointer-events-none absolute -top-20 -right-10 w-72 h-72 rounded-full opacity-30 blur-[80px]"
            style={{ background: 'radial-gradient(circle, #33C2E8 0%, transparent 70%)' }}
          />
          <div className="relative z-10 w-20 h-20 shrink-0 rounded-full bg-accent-500 flex items-center justify-center text-2xl font-semibold text-ink-950 shadow-[0_0_24px_rgba(51,194,232,0.35)]">
            {initials}
          </div>
          <div className="relative z-10 min-w-0">
            <h2 className="font-display text-2xl text-ink-100 truncate">{user?.name ?? 'Kullanıcı'}</h2>
            <p className="text-ink-400 text-sm mt-1 truncate">{user?.email ?? '—'}</p>
            {user?.id && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
                <Hash size={11} /> Kullanıcı #{user.id}
              </div>
            )}
          </div>
        </div>

        {/* Düzenlenebilir bilgiler */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl">
          <h3 className="font-display text-base text-ink-100 mb-1">Kişisel Bilgiler</h3>
          <p className="text-sm text-ink-400 mb-6">Adınız ve e-posta adresiniz platform genelinde bu şekilde görünür.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-400">Ad Soyad</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 text-ink-400" size={16} />
                <input defaultValue={user?.name || ''} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-400">E-posta Adresi</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-ink-400" size={16} />
                <input defaultValue={user?.email || ''} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-accent-500 text-ink-950 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors shadow-[0_0_16px_rgba(51,194,232,0.25)]">
              <Save size={16} /> Değişiklikleri Kaydet
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
