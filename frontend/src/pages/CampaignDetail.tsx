import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Wallet, Users, Check, ImagePlus, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { Campaign } from '../lib/types';

const STATUS_STYLE: Record<Campaign['approval_status'], string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  approved: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-rose-500/10 text-rose-400',
};

const STATUS_LABEL: Record<Campaign['approval_status'], string> = {
  pending: 'Onay Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadError, setLoadError] = useState(false);
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
      try {
        const data = await campaignsApi.get(id);
        if (cancelled) return;
        setCampaign(data);
        setLoadError(false);
        // Ajanlar henüz sonuç üretmediyse ya da Google Ads'e yayın sürüyorsa birkaç saniyede bir tekrar sor
        if (!data.ai_analysis_results || data.google_ads_status === 'publishing') {
          timer = setTimeout(load, 4000);
        }
      } catch {
        if (cancelled) return;
        setLoadError(true);
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
      <AppLayout title="Kampanya" subtitle={loadError ? 'Bağlantı sorunu' : 'Yükleniyor...'}>
        {loadError ? (
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertTriangle size={16} /> Kampanya yüklenemedi, tekrar deneniyor...
          </div>
        ) : (
          <div className="text-ink-400 text-sm">Yükleniyor...</div>
        )}
      </AppLayout>
    );
  }

  const results = campaign.ai_analysis_results;

  return (
    <AppLayout title={campaign.target_url_or_product} subtitle="Kampanya detayı ve AI ajan çıktısı.">
      <div className="space-y-4 pb-12">

        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 flex flex-wrap items-center gap-6">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${STATUS_STYLE[campaign.approval_status]}`}>
            {STATUS_LABEL[campaign.approval_status]}
          </span>
          <div className="flex items-center gap-1.5">
            {campaign.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-ink-400">
            <Wallet size={15} className="text-ink-400" /> Günlük Bütçe: <span className="text-ink-100 font-medium">₺{campaign.daily_budget}</span>
          </div>
          {campaign.target_audience && (
            <div className="flex items-center gap-1.5 text-sm text-ink-400">
              <Users size={15} className="text-ink-400" /> {campaign.target_audience}
            </div>
          )}
        </div>

        {campaign.assets && campaign.assets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink-100 mb-3 flex items-center gap-2">
              <ImagePlus size={16} className="text-ink-400" /> Yüklediğiniz Görsel/Videolar
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {campaign.assets.map((asset) => (
                <div key={asset.id} className="rounded-xl overflow-hidden border border-glass/10 bg-glass/[0.03] aspect-square">
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
          <div className="border border-dashed border-glass/15 rounded-2xl p-12 text-center space-y-2">
            <Activity size={22} className="mx-auto text-ink-400 animate-pulse" />
            <p className="text-ink-400 text-sm">
              AI ajanları bu kampanya için içerik üretiyor... (araştırma + reklam metni + görsel, genelde 30-60 saniye sürer)
            </p>
          </div>
        )}

        {results?.strategy_brief && (
          <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-ink-100 mb-3">Strateji Brief'i</h4>
            <p className="text-sm text-ink-300 whitespace-pre-line leading-relaxed">
              {results.strategy_brief.replace(/^#+\s*/gm, '').replace(/\*\*/g, '')}
            </p>
          </div>
        )}

        {results?.creatives && results.creatives.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-ink-100">Üretilen Reklamlar</h4>
              {campaign.approval_status === 'pending' && (
                <p className="text-xs text-ink-400">Yayınlanacak reklamı seç</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.creatives.map((creative, i) => {
                const isSelected = campaign.selected_creative_index === i;
                const isApproved = campaign.approval_status !== 'pending';
                return (
                  <div
                    key={i}
                    className={`bg-glass/[0.03] backdrop-blur-xl border rounded-2xl overflow-hidden flex flex-col transition-colors ${
                      isSelected
                        ? 'border-accent-500 ring-1 ring-accent-500'
                        : 'border-glass/10'
                    } ${isApproved && !isSelected ? 'opacity-50' : ''}`}
                  >
                    <div className="relative">
                      {creative.generated_image_url ? (
                        <img src={creative.generated_image_url} alt={creative.target_audience} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-glass/[0.04] flex items-center justify-center text-ink-400 text-xs">
                          Görsel yok
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-accent-500 text-ink-950 text-[11px] font-semibold px-2 py-1 rounded-full">
                          <Check size={12} strokeWidth={2.5} /> Seçildi
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                      <p className="text-xs font-medium text-accent-400">{creative.target_audience}</p>
                      <p className="text-sm text-ink-300 leading-relaxed flex-1">{creative.ad_copy}</p>
                      {!isApproved && (
                        <button
                          onClick={() => handleSelect(i)}
                          disabled={selecting !== null}
                          className="mt-2 w-full py-2 rounded-lg text-sm font-medium border border-glass/10 text-ink-300 hover:bg-accent-500 hover:text-ink-950 hover:border-accent-500 disabled:opacity-50 transition-colors"
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

        {campaign.google_ads_status === 'publishing' && (
          <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 flex items-center gap-3">
            <Loader2 size={18} className="text-accent-400 animate-spin shrink-0" />
            <p className="text-sm text-ink-300">
              Google Ads test hesabınızda gerçek bir kampanya oluşturuluyor... (genelde 15-30 saniye sürer)
            </p>
          </div>
        )}

        {campaign.google_ads_status === 'published' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-3">
            <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-emerald-400">
                Google Ads'de gerçek bir kampanya olarak oluşturuldu (duraklatılmış / PAUSED).
              </p>
              <p className="text-xs text-emerald-400/70">
                Kampanya ID: {campaign.google_ads_campaign_id} · Gerçekten yayına almak için Google Ads panelinden kampanyayı etkinleştirmen gerekiyor.
              </p>
              <a
                href={`https://ads.google.com/aw/campaigns?campaignId=${campaign.google_ads_campaign_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:underline"
              >
                Google Ads'de görüntüle <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {campaign.google_ads_status === 'failed' && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-rose-400">Google Ads'e yayınlanamadı.</p>
              {campaign.google_ads_error && (
                <p className="text-xs text-rose-400/70">{campaign.google_ads_error}</p>
              )}
              {campaign.selected_creative_index != null && (
                <button
                  onClick={() => handleSelect(campaign.selected_creative_index!)}
                  disabled={selecting !== null}
                  className="text-xs font-medium text-rose-400 hover:underline disabled:opacity-50"
                >
                  {selecting !== null ? 'Deneniyor...' : 'Tekrar dene'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
