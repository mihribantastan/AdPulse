import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Wallet, Users, Check, ImagePlus } from 'lucide-react';
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
  const [selecting, setSelecting] = useState<number | null>(null);

  const handleSelect = async (index: number) => {
    if (!id) return;
    setSelecting(index);
    try {
      const { data } = await campaignsApi.approve(id, index);
      setCampaign(data);
    } finally {
      setSelecting(null);
    }
  };

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

        {campaign.assets && campaign.assets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ImagePlus size={16} className="text-slate-400" /> Yüklediğiniz Görsel/Videolar
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {campaign.assets.map((asset) => (
                <div key={asset.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-square">
                  {asset.type === 'video' ? (
                    <video src={asset.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={asset.url} alt={asset.original_name ?? ''} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Üretilen Reklamlar</h4>
              {campaign.approval_status === 'pending' && (
                <p className="text-xs text-slate-400">Yayınlanacak reklamı seç</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.creatives.map((creative, i) => {
                const isSelected = campaign.selected_creative_index === i;
                const isApproved = campaign.approval_status !== 'pending';
                return (
                  <div
                    key={i}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden flex flex-col transition-colors ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800'
                    } ${isApproved && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="relative">
                      {creative.generated_image_url ? (
                        <img src={creative.generated_image_url} alt={creative.target_audience} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                          Görsel yok
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-blue-600 text-white text-[11px] font-medium px-2 py-1 rounded-full">
                          <Check size={12} strokeWidth={2.5} /> Seçildi
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{creative.target_audience}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">{creative.ad_copy}</p>
                      {!isApproved && (
                        <button
                          onClick={() => handleSelect(i)}
                          disabled={selecting !== null}
                          className="mt-2 w-full py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 disabled:opacity-50 transition-colors"
                        >
                          {selecting === i ? 'Seçiliyor...' : 'Bu reklamı seç'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
