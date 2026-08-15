import { ShieldAlert, Link2, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Toggle } from '../components/Toggle';
import { useReportPreferences } from '../hooks/useReportPreferences';

export function Settings() {
  const { prefs, update } = useReportPreferences();

  return (
    <AppLayout title="Sistem Ayarları" subtitle="AI platform bağlantılarınızı ve güvenlik sınırlarınızı yönetin.">
      <div className="max-w-3xl mx-auto space-y-4 pb-10">

        {/* Bütçe Koruması (AI Güvenliği) */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-400">
              <ShieldAlert size={19} />
            </div>
            <div>
              <h3 className="font-display text-base text-ink-100">AI Bütçe Koruması</h3>
              <p className="text-sm text-ink-400 mt-0.5">Yapay zekanın harcama limitlerini belirleyin.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl mb-6">
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300 leading-relaxed">
              Bu üst sınırı aşan hiçbir kampanya yapay zeka tarafından onaylanamaz. Otonom ajanların bütçeyi kontrolsüz harcamasına karşı son güvenlik hattınızdır.
            </p>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <label className="block text-xs font-medium text-ink-400">Maksimum Günlük Limit (₺)</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-ink-400 font-medium text-sm">₺</span>
              <input
                defaultValue="5000"
                type="number"
                className="w-full bg-glass/[0.03] border border-glass/10 rounded-lg py-2.5 pl-8 pr-4 text-sm font-medium outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 transition-colors text-ink-100"
              />
            </div>
          </div>
        </div>

        {/* Rapor Tercihleri */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent-500/10 border border-accent-500/20 rounded-lg flex items-center justify-center text-accent-400">
              <FileText size={19} />
            </div>
            <div>
              <h3 className="font-display text-base text-ink-100">Rapor Tercihleri</h3>
              <p className="text-sm text-ink-400 mt-0.5">Bireysel kampanya raporlarında ve PDF indirmelerinde neyin görüneceğini seçin.</p>
            </div>
          </div>

          <div className="divide-y divide-glass/10">
            <Toggle
              label="Tıklama Trendi Grafiği"
              description="Son 14 günün günlük tıklama grafiği."
              checked={prefs.clicksChart}
              onChange={(v) => update({ clicksChart: v })}
            />
            <Toggle
              label="Harcama & Gelir Grafiği"
              description="Bütçe harcaması ile geri dönüşün karşılaştırması."
              checked={prefs.spendRevenueChart}
              onChange={(v) => update({ spendRevenueChart: v })}
            />
            <Toggle
              label="AI Strateji Özeti"
              description="Ajanların ürettiği yazılı strateji brief'i."
              checked={prefs.strategyBrief}
              onChange={(v) => update({ strategyBrief: v })}
            />
          </div>
        </div>

        {/* Platform Bağlantıları */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-accent-500/10 border border-accent-500/20 rounded-lg flex items-center justify-center text-accent-400">
              <Link2 size={19} />
            </div>
            <div>
              <h3 className="font-display text-base text-ink-100">Ağ Bağlantıları</h3>
              <p className="text-sm text-ink-400 mt-0.5">Dış platform entegrasyonları.</p>
            </div>
          </div>

          <div className="bg-glass/[0.02] border border-dashed border-glass/15 p-8 rounded-xl text-center">
            <div className="w-12 h-12 bg-glass/[0.04] rounded-full flex items-center justify-center mx-auto mb-3 border border-glass/10">
              <Sparkles size={20} className="text-ink-400" />
            </div>
            <h4 className="text-sm font-semibold text-ink-100 mb-1.5">Entegrasyonlar Hazırlanıyor</h4>
            <p className="text-sm text-ink-400 max-w-lg mx-auto leading-relaxed">
              Google Ads ve Meta hesap bağlantıları OAuth2 protokolü ile güvenlik altına alınmaktadır. Ham API anahtarı hiçbir sistemde saklanmaz. Bağlantı ekranı, <strong className="font-medium text-ink-100">Domains/Integration</strong> katmanı tamamlandığında aktif edilecektir.
            </p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
