import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Wallet, Users } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { Campaign } from '../lib/types';

const STATUS_LABEL: Record<Campaign['approval_status'], string> = {
  pending: 'Onay Bekliyor',
  approved: 'Yayında',
  rejected: 'Reddedildi',
};

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      const data = await campaignsApi.get(id);
      if (cancelled) return;
      setCampaign(data);
      // Ajanlar henüz sonuç üretmediyse birkaç saniyede bir tekrar sor
      if (!data.ai_analysis_results) {
        timer = setTimeout(load, 4000);
      }
    };

    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  if (!campaign) {
    return (
      <AppLayout title="Kampanya" subtitle="Yükleniyor...">
        <div className="text-slate-400 text-sm">Yükleniyor...</div>
      </AppLayout>
    );
  }

  const results = campaign.ai_analysis_results;

  return (
    <AppLayout title={campaign.target_url_or_product} subtitle="Kampanya detayı ve AI ajan çıktısı.">
      <div className="space-y-4 pb-12">

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-wrap items-center gap-6">
          <span className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md">
            {STATUS_LABEL[campaign.approval_status]}
          </span>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            {campaign.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <Wallet size={15} className="text-slate-400" /> Günlük Bütçe: ₺{campaign.daily_budget}
          </div>
          {campaign.target_audience && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <Users size={15} className="text-slate-400" /> {campaign.target_audience}
            </div>
          )}
        </div>

        {!results && (
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center space-y-2">
            <Activity size={22} className="mx-auto text-slate-400 animate-pulse" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              AI ajanları bu kampanya için içerik üretiyor... (araştırma + reklam metni + görsel, genelde 30-60 saniye sürer)
            </p>
          </div>
        )}

        {results?.strategy_brief && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Strateji Brief'i</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {results.strategy_brief.replace(/^#+\s*/gm, '').replace(/\*\*/g, '')}
            </p>
          </div>
        )}

        {results?.creatives && results.creatives.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Üretilen Reklamlar</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.creatives.map((creative, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                  {creative.generated_image_url ? (
                    <img src={creative.generated_image_url} alt={creative.target_audience} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                      Görsel yok
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{creative.target_audience}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{creative.ad_copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
