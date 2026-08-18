import { useState } from 'react';
import { Mail, User as UserIcon, Save, Hash, Check, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/useAuth';
import { authApi } from '../lib/api';

const inputClass = 'w-full bg-glass/[0.03] border border-glass/10 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 transition-colors text-ink-100';

export function Profile() {
  // ProtectedRoute, user yüklenmeden bu sayfayı hiç render etmiyor - ilk değer olarak
  // güvenle okunabilir; sonraki senkronizasyon için ayrı bir effect'e gerek yok.
  const { user, refresh } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'AD';

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setStatus('saving');
    setError(null);
    try {
      await authApi.update({ name, email });
      await refresh();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi.');
      setStatus('error');
    }
  };

  return (
    <AppLayout title="Profilim" subtitle="Kimliğiniz ve hesap bilgileriniz.">
      <div className="max-w-3xl mx-auto space-y-4 pb-10">

        {/* Kimlik başlığı */}
        <div className="relative overflow-hidden rounded-2xl bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-8 flex items-center gap-6">
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
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono text-ink-400 bg-glass/[0.04] border border-glass/10 rounded-full px-3 py-1">
                <Hash size={11} /> Kullanıcı #{user.id}
              </div>
            )}
          </div>
        </div>

        {/* Düzenlenebilir bilgiler */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-6 md:p-8 rounded-2xl">
          <h3 className="font-display text-base text-ink-100 mb-1">Kişisel Bilgiler</h3>
          <p className="text-sm text-ink-400 mb-6">Adınız ve e-posta adresiniz platform genelinde bu şekilde görünür.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-400">Ad Soyad</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 text-ink-400" size={16} />
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-ink-400">E-posta Adresi</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-ink-400" size={16} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {status === 'error' && error && (
            <div className="flex items-center gap-2 text-sm text-rose-400 mb-4">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {status === 'saved' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check size={15} /> Kaydedildi
              </span>
            )}
            <button
              onClick={save}
              disabled={status === 'saving' || !name || !email}
              className="flex items-center gap-2 bg-accent-500 text-ink-950 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors shadow-[0_0_16px_rgba(51,194,232,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {status === 'saving' ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
