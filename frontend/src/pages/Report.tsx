import { FileText, Download, TrendingUp, ArrowRight, Activity, Calendar } from 'lucide-react';
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
  },
  {
    id: 2,
    title: 'Z Kuşağı TikTok Analizi',
    type: 'Kitle Raporu',
    date: '28 Tem 2026',
    status: 'ready',
    insight: 'Video içeriklerindeki "ilk 3 saniye kancası" izlenme oranını %40 artırdı. Kreatif ajanın ürettiği metinler yüksek etkileşim aldı.',
  },
  {
    id: 3,
    title: 'Sonbahar Kampanyası Bütçe Projeksiyonu',
    type: 'AI Tahmini',
    date: 'Şimdi',
    status: 'processing',
    insight: 'Yapay zeka ajanları geçmiş 2 yıllık verilerinizi işliyor. Bu işlem yaklaşık 2 dakika sürecektir...',
  },
];

export function Reports() {
  return (
    <AppLayout title="Ağ Raporları" subtitle="Yapay zekanın hazırladığı analizler ve içgörüler.">
      <div className="space-y-4">

        {/* Üst Bilgi Kartı (AI Özet) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:border dark:border-slate-800 p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200">
              Haftalık AI Özeti
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
              Reklam harcamalarınız geçen haftaya göre <span className="text-blue-400">%12 daha verimli</span> kullanıldı.
            </h3>
            <p className="text-slate-300 text-sm">Ajanlar bütçenizi düşük performans gösteren TikTok kampanyasından çekerek Google Arama ağına yönlendirdi.</p>
          </div>

          <div className="shrink-0 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center relative z-10">
            <TrendingUp size={40} className="text-white" />
          </div>
        </div>

        {/* Rapor Listesi */}
        <div className="flex items-center justify-between pt-4">
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">Son Üretilen Raporlar</h4>
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5">
            Tümünü Gör <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_REPORTS.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                  {report.status === 'processing' ? <Activity size={19} className="animate-pulse" /> : <FileText size={19} />}
                </div>

                {report.status === 'processing' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-medium rounded-full">
                    <Activity size={11} className="animate-spin" /> İşleniyor
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Hazır
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Calendar size={13} /> {report.date} • {report.type}
                </div>
                <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {report.title}
                </h5>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {report.insight}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={report.status === 'processing'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300 transition-colors"
                >
                  {report.status === 'processing' ? (
                    <>Veriler Derleniyor...</>
                  ) : (
                    <>
                      <Download size={15} /> Raporu İndir
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
