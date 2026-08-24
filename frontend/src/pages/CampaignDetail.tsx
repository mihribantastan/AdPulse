import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Wallet, Users, Check, ImagePlus, ExternalLink, AlertTriangle, Loader2, FileText } from 'lucide-react';
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
  const [pickedCopy, setPickedCopy] = useState<number | null>(null);
  const [pickedImage, setPickedImage] = useState<number | null>(null);
  const [approving, setApproving] = useState(false);

  const confirmSelection = async (copyIndex: number, imageIndex: number) => {
    if (!id) return;
    setApproving(true);
    try {
      const { data } = await campaignsApi.approve(id, copyIndex, imageIndex);
      setCampaign(data);
    } finally {
      setApproving(false);
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
        // Ajanlar henüz sonuç üretmediyse ya da bir platforma yayın sürüyorsa birkaç saniyede bir tekrar sor
        if (!data.ai_analysis_results || data.google_ads_status === 'publishing' || data.meta_status === 'publishing') {
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

        {results?.creatives && results.creatives.length > 0 && (() => {
          const isApproved = campaign.approval_status !== 'pending';
          const activeCopy = isApproved ? campaign.selected_copy_index ?? null : pickedCopy;
          const activeImage = isApproved ? campaign.selected_image_index ?? null : pickedImage;
          // AI kreatiflerinden sonra kullanıcının kendi yüklediği görseller de seçilebilir -
          // indeksleri creatives'in devamı (bkz. backend CampaignController::approve).
          const ownImages = (campaign.assets ?? []).filter((a) => a.type === 'image');

          return (
            <div className="space-y-5">
              {/* Reklam metinleri - bağımsız seçim */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-ink-100 flex items-center gap-2">
                    <FileText size={16} className="text-ink-400" /> Reklam Metinleri
                  </h4>
                  {!isApproved && <p className="text-xs text-ink-400">Yayınlanacak metni seç</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.creatives.map((creative, i) => {
                    const isActive = activeCopy === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isApproved}
                        onClick={() => setPickedCopy(i)}
                        className={`text-left bg-glass/[0.03] backdrop-blur-xl border rounded-2xl p-4 space-y-2 transition-colors ${
                          isActive ? 'border-accent-500 ring-1 ring-accent-500' : 'border-glass/10 hover:border-glass/20'
                        } ${isApproved && !isActive ? 'opacity-40' : ''} ${isApproved ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-accent-400">{creative.angle}</p>
                          {isActive && (
                            <span className="flex items-center gap-1 bg-accent-500 text-ink-950 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                              <Check size={10} strokeWidth={3} /> Seçili
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-300 leading-relaxed">{creative.ad_copy}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Görseller - bağımsız seçim, farklı bir metinle eşleştirilebilir */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-ink-100 flex items-center gap-2">
                    <ImagePlus size={16} className="text-ink-400" /> Görseller
                  </h4>
                  {!isApproved && <p className="text-xs text-ink-400">Yayınlanacak görseli seç</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.creatives.map((creative, i) => {
                    const isActive = activeImage === i;
                    const hasImage = !!creative.generated_image_url;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isApproved || !hasImage}
                        onClick={() => setPickedImage(i)}
                        className={`relative rounded-2xl overflow-hidden border transition-colors aspect-square ${
                          isActive ? 'border-accent-500 ring-1 ring-accent-500' : 'border-glass/10 hover:border-glass/20'
                        } ${isApproved && !isActive ? 'opacity-40' : ''} ${!hasImage ? 'cursor-not-allowed' : isApproved ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {hasImage ? (
                          <img src={creative.generated_image_url!} alt={creative.angle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-glass/[0.04] flex items-center justify-center text-ink-400 text-xs">
                            Görsel yok
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                          {creative.angle}
                        </span>
                        {isActive && (
                          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-accent-500 text-ink-950 text-[11px] font-semibold px-2 py-1 rounded-full">
                            <Check size={12} strokeWidth={2.5} /> Seçili
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {ownImages.map((asset, j) => {
                    const i = results.creatives!.length + j;
                    const isActive = activeImage === i;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        disabled={isApproved}
                        onClick={() => setPickedImage(i)}
                        className={`relative rounded-2xl overflow-hidden border transition-colors aspect-square ${
                          isActive ? 'border-accent-500 ring-1 ring-accent-500' : 'border-glass/10 hover:border-glass/20'
                        } ${isApproved && !isActive ? 'opacity-40' : ''} ${isApproved ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <img src={asset.url} alt={asset.original_name ?? 'Kendi görseliniz'} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                          Kendi Görseliniz
                        </span>
                        {isActive && (
                          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-accent-500 text-ink-950 text-[11px] font-semibold px-2 py-1 rounded-full">
                            <Check size={12} strokeWidth={2.5} /> Seçili
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isApproved && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => pickedCopy !== null && pickedImage !== null && confirmSelection(pickedCopy, pickedImage)}
                    disabled={pickedCopy === null || pickedImage === null || approving}
                    className="flex items-center gap-2 bg-accent-500 text-ink-950 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approving ? 'Onaylanıyor...' : 'Seçimi Onayla ve Yayınla'}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

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
              {campaign.selected_copy_index != null && campaign.selected_image_index != null && (
                <button
                  onClick={() => confirmSelection(campaign.selected_copy_index!, campaign.selected_image_index!)}
                  disabled={approving}
                  className="text-xs font-medium text-rose-400 hover:underline disabled:opacity-50"
                >
                  {approving ? 'Deneniyor...' : 'Tekrar dene'}
                </button>
              )}
            </div>
          </div>
        )}

        {campaign.meta_status === 'publishing' && (
          <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 flex items-center gap-3">
            <Loader2 size={18} className="text-accent-400 animate-spin shrink-0" />
            <p className="text-sm text-ink-300">
              Meta (Facebook/Instagram) hesabınızda gerçek bir kampanya oluşturuluyor... (genelde 15-30 saniye sürer)
            </p>
          </div>
        )}

        {campaign.meta_status === 'published' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-3">
            <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-emerald-400">
                Meta'da gerçek bir kampanya olarak oluşturuldu (duraklatılmış / PAUSED).
              </p>
              <p className="text-xs text-emerald-400/70">
                Kampanya ID: {campaign.meta_campaign_id} · Gerçekten yayına almak için Meta Ads Manager panelinden kampanyayı etkinleştirmen gerekiyor.
              </p>
              <a
                href="https://business.facebook.com/adsmanager/manage/campaigns"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:underline"
              >
                Meta Ads Manager'da görüntüle <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {campaign.meta_status === 'failed' && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-rose-400">Meta'ya yayınlanamadı.</p>
              {campaign.meta_error && (
                <p className="text-xs text-rose-400/70">{campaign.meta_error}</p>
              )}
              {campaign.selected_copy_index != null && campaign.selected_image_index != null && (
                <button
                  onClick={() => confirmSelection(campaign.selected_copy_index!, campaign.selected_image_index!)}
                  disabled={approving}
                  className="text-xs font-medium text-rose-400 hover:underline disabled:opacity-50"
                >
                  {approving ? 'Deneniyor...' : 'Tekrar dene'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
