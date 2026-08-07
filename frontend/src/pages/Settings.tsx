import { User as UserIcon, Mail, ShieldAlert, Link2, Save, Sparkles, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/useAuth';

export function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout title="Sistem Ayarları" subtitle="Hesabınızı ve AI platform bağlantılarınızı yönetin.">
      <div className="max-w-3xl mx-auto space-y-4 pb-10">

        {/* 1. Profil Ayarları */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300">
              <UserIcon size={19} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Kullanıcı Profili</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Temel hesap bilgilerinizi güncelleyin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Ad Soyad</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  defaultValue={user?.name || ''}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">E-posta Adresi</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  defaultValue={user?.email || ''}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              <Save size={16} /> Değişiklikleri Kaydet
            </button>
          </div>
        </div>

        {/* 2. Bütçe Koruması (AI Güvenliği) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert size={19} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">AI Bütçe Koruması</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Yapay zekanın harcama limitlerini belirleyin.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-900/40 p-4 rounded-xl mb-6">
            <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
              Bu üst sınırı aşan hiçbir kampanya yapay zeka tarafından onaylanamaz. Otonom ajanların bütçeyi kontrolsüz harcamasına karşı son güvenlik hattınızdır.
            </p>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Maksimum Günlük Limit (₺)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 font-medium text-sm">₺</span>
              <input
                defaultValue="5000"
                type="number"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-8 pr-4 text-sm font-medium outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Platform Bağlantıları */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Link2 size={19} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Ağ Bağlantıları</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Dış platform entegrasyonları.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 p-8 rounded-xl text-center">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-800">
              <Sparkles size={20} className="text-slate-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5">Entegrasyonlar Hazırlanıyor</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Google Ads ve Meta hesap bağlantıları OAuth2 protokolü ile güvenlik altına alınmaktadır. Ham API anahtarı hiçbir sistemde saklanmaz. Bağlantı ekranı, <strong className="font-medium text-slate-600 dark:text-slate-300">Domains/Integration</strong> katmanı tamamlandığında aktif edilecektir.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
