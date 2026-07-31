import { FileText, Download, Sparkles, TrendingUp, ArrowRight, Activity, Calendar } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';

// Örnek Rapor Verileri (AI tarafından üretilmiş gibi)
const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Temmuz 2026 Performans Özeti',
    type: 'Genel Bakış',
    date: '30 Tem 2026',
    status: 'ready',
    insight: 'Google Ads CTR oranınız sektör ortalamasının %24 üzerinde seyrediyor. Bütçenin Meta platformundan Google Arama ağına kaydırılması önerilir.',
    color: 'from-blue-600 to-indigo-500 dark:from-cyan-400 dark:to-blue-500',
  },
  {
    id: 2,
    title: 'Z Kuşağı TikTok Analizi',
    type: 'Kitle Raporu',
    date: '28 Tem 2026',
    status: 'ready',
    insight: 'Video içeriklerindeki "ilk 3 saniye kancası" izlenme oranını %40 artırdı. Kreatif ajanın ürettiği metinler yüksek etkileşim aldı.',
    color: 'from-fuchsia-600 to-pink-500 dark:from-purple-400 dark:to-pink-500',
  },
  {
    id: 3,
    title: 'Sonbahar Kampanyası Bütçe Projeksiyonu',
    type: 'AI Tahmini',
    date: 'Şimdi',
    status: 'processing',
    insight: 'Yapay zeka ajanları geçmiş 2 yıllık verilerinizi işliyor. Bu işlem yaklaşık 2 dakika sürecektir...',
    color: 'from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700',
  },
];

export function Reports() {
  return (
    <AppLayout title="Ağ Raporları" subtitle="Yapay zekanın hazırladığı analizler ve içgörüler.">
      
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Üst Bilgi Kartı (AI Özet) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-cyan-900/80 dark:to-purple-900/80 rounded-[2.5rem] p-8 md:p-10 text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)] dark:shadow-[0_20px_50px_rgba(34,211,238,0.15)] relative overflow-hidden border border-white/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest border border-white/30">
                <Sparkles size={14} className="text-yellow-300 animate-pulse" /> Haftalık AI Özeti
              </div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Reklam harcamalarınız geçen haftaya göre <span className="text-yellow-300">%12 daha verimli</span> kullanıldı.
              </h3>
              <p className="text-blue-100 font-medium">Ajanlar bütçenizi düşük performans gösteren TikTok kampanyasından çekerek Google Arama ağına yönlendirdi.</p>
            </div>
            
            <div className="shrink-0 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center shadow-inner">
              <TrendingUp size={64} className="text-white opacity-80" />
            </div>
          </div>
        </div>

        {/* Rapor Listesi */}
        <div className="flex items-center justify-between px-2 pt-4">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">Son Üretilen Raporlar</h4>
          <button className="text-sm font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors flex items-center gap-2">
            Tümünü Gör <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_REPORTS.map((report) => (
            <div 
              key={report.id}
              className="bg-white/70 dark:bg-[#0A101D]/70 backdrop-blur-xl border border-white dark:border-slate-800/50 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(34,211,238,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group cursor-pointer relative overflow-hidden"
            >
              {/* Durum Göstergesi (Hazır veya İşleniyor) */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${report.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  {report.status === 'processing' ? <Activity size={24} className="animate-pulse" /> : <FileText size={24} />}
                </div>
                
                {report.status === 'processing' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-200 dark:border-amber-500/20 uppercase tracking-widest">
                    <Activity size={12} className="animate-spin" /> İşleniyor
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hazır
                  </span>
                )}
              </div>

              {/* Rapor İçeriği */}
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                  <Calendar size={14} /> {report.date} • {report.type}
                </div>
                <h5 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                  {report.title}
                </h5>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {report.insight}
                </p>
              </div>

              {/* Aksiyon Butonu */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 relative z-10">
                <button 
                  disabled={report.status === 'processing'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm bg-slate-50 dark:bg-[#131B2C] text-slate-700 dark:text-slate-300 hover:bg-blue-600 dark:hover:bg-cyan-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-[#131B2C] disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700/80"
                >
                  {report.status === 'processing' ? (
                    <>Veriler Derleniyor...</>
                  ) : (
                    <>
                      <Download size={16} /> Raporu İndir
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </AppLayout>
  );
}