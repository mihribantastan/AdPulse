import { User as UserIcon, Mail, ShieldAlert, Link2, Save, Sparkles, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout title="Sistem Ayarları" subtitle="Hesabınızı ve AI platform bağlantılarınızı yönetin.">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        
        {/* 1. Profil Ayarları */}
        <div className="bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(34,211,238,0.02)] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 dark:bg-cyan-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-cyan-500/20 shadow-inner">
              <UserIcon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Kullanıcı Profili</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Temel hesap bilgilerinizi güncelleyin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Ad Soyad</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-5 text-slate-400 dark:text-slate-500" size={18} />
                <input 
                  defaultValue={user?.name || ''} 
                  className="w-full bg-slate-50 dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 rounded-full py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors shadow-inner dark:text-white" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">E-posta Adresi</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-5 text-slate-400 dark:text-slate-500" size={18} />
                <input 
                  defaultValue={user?.email || ''} 
                  className="w-full bg-slate-50 dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 rounded-full py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 dark:focus:border-cyan-500 transition-colors shadow-inner dark:text-white" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 dark:bg-cyan-500 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/30 dark:shadow-cyan-500/30">
              <Save size={18} /> Değişiklikleri Kaydet
            </button>
          </div>
        </div>

        {/* 2. Bütçe Koruması (AI Güvenliği) */}
        <div className="bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(34,211,238,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors"></div>
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 shadow-inner">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Bütçe Koruması</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Yapay zekanın harcama limitlerini belirleyin.</p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start gap-3 bg-rose-50 dark:bg-[#1A151E] border border-rose-100 dark:border-rose-900/50 p-5 rounded-2xl mb-8">
              <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300 leading-relaxed">
                Bu üst sınırı aşan hiçbir kampanya yapay zeka tarafından onaylanamaz. Otonom ajanların bütçeyi kontrolsüz harcamasına karşı son güvenlik hattınızdır.
              </p>
            </div>
            
            <div className="space-y-2 max-w-sm">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-4">Maksimum Günlük Limit (₺)</label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-slate-400 dark:text-slate-500 font-bold">₺</span>
                <input 
                  defaultValue="5000" 
                  type="number"
                  className="w-full bg-slate-50 dark:bg-[#131B2C] border border-slate-200 dark:border-slate-700/80 rounded-full py-4 pl-12 pr-6 text-lg font-black outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-colors shadow-inner dark:text-white" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Platform Bağlantıları */}
        <div className="bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white dark:border-slate-800/50 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(34,211,238,0.02)] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
              <Link2 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ağ Bağlantıları</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Dış platform entegrasyonları.</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#131B2C] border border-dashed border-slate-300 dark:border-slate-700 p-8 rounded-3xl text-center">
            <div className="w-16 h-16 bg-white dark:bg-[#0A101D] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Sparkles size={24} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Entegrasyonlar Hazırlanıyor</h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Google Ads ve Meta hesap bağlantıları OAuth2 protokolü ile güvenlik altına alınmaktadır. Ham API anahtarı hiçbir sistemde saklanmaz. Bağlantı ekranı, <strong>Domains/Integration</strong> katmanı tamamlandığında aktif edilecektir.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}