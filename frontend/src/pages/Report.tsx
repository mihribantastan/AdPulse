import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Activity, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { Campaign } from '../lib/types';

const STATUS_STYLE: Record<Campaign['approval_status'], { label: string; className: string }> = {
  pending: { label: 'Onay Bekliyor', className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  approved: { label: 'Yayında', className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  rejected: { label: 'Reddedildi', className: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Reports() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    campaignsApi.list().then((data) => {
      setCampaigns(data);
      setLoaded(true);
    });
  }, []);

  const withInsights = campaigns.filter((c) => c.ai_analysis_results?.strategy_brief).length;
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.daily_budget), 0);

  return (
    <AppLayout title="Ağ Raporları" subtitle="Kampanyalarınız ve yapay zekanın ürettiği stratejiler.">
      <div className="space-y-4">

        {/* Üst Bilgi Kartı */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:border dark:border-slate-800 p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200">
              Kampanya Özeti
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
              {!loaded
                ? 'Kampanyalarınız yükleniyor...'
                : campaigns.length > 0
                  ? <>Yapay zeka <span className="text-blue-400">{withInsights} kampanya</span> için strateji ve reklam metni üretti.</>
                  : 'Henüz bir kampanya oluşturmadınız.'}
            </h3>
            <p className="text-slate-300 text-sm">
              {loaded && (campaigns.length > 0
                ? `Toplam ₺${totalBudget.toLocaleString('tr-TR')} günlük bütçe, ${campaigns.length} kampanyaya dağıtılmış durumda.`
                : '"Yeni Oluştur" ile ilk kampanyanızı başlattığınızda AI analizleri burada listelenecek.')}
            </p>
          </div>

          <div className="shrink-0 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center relative z-10">
            <TrendingUp size={40} className="text-white" />
          </div>
        </div>

        {/* Kampanya Listesi */}
        {loaded && campaigns.length > 0 && (
          <>
            <div className="flex items-center justify-between pt-4">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Kampanyalarınız</h4>
              <button
                onClick={() => navigate('/app/campaigns')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5"
              >
                Tümünü Gör <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => {
                const status = STATUS_STYLE[campaign.approval_status];
                const brief = campaign.ai_analysis_results?.strategy_brief;
                const isProcessing = !campaign.ai_analysis_results;

                return (
                  <div
                    key={campaign.id}
                    onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                        {isProcessing ? <Activity size={19} className="animate-pulse" /> : <FileText size={19} />}
                      </div>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full ${status.className}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <Calendar size={13} /> {formatDate(campaign.created_at)}
                      </div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                        {campaign.target_url_or_product}
                      </h5>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {isProcessing
                          ? 'AI ajanları bu kampanya için strateji ve reklam metni üretiyor...'
                          : brief?.replace(/^#+\s*/gm, '').replace(/\*\*/g, '') ?? 'İçerik bulunamadı.'}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {campaign.platforms.map((p) => (
                          <PlatformBadge key={p} platform={p} size="sm" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <Wallet size={12} /> ₺{Number(campaign.daily_budget).toLocaleString('tr-TR')}/gün
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {loaded && campaigns.length === 0 && (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Henüz kampanya oluşturulmadı.</p>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
