import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Users, Wallet, Layers, Sparkles, MessageSquarePlus, Goal, MousePointerClick, ImagePlus, X, Film, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { BrandTone, CampaignGoal, CtaPreference, Platform } from '../lib/types';
import { BRAND_TONE_LABELS, CAMPAIGN_GOAL_LABELS, CTA_LABELS, PLATFORM_LABELS } from '../lib/types';

const ALL_PLATFORMS: Platform[] = ['google_ads', 'instagram', 'facebook', 'youtube', 'tiktok', 'x'];
const ALL_TONES: BrandTone[] = ['profesyonel', 'samimi', 'eglenceli', 'lux', 'enerjik'];
const ALL_GOALS: CampaignGoal[] = ['brand_awareness', 'conversions', 'traffic', 'lead_generation', 'app_installs'];
const ALL_CTAS: CtaPreference[] = ['buy_now', 'learn_more', 'try_free', 'sign_up', 'contact_us'];

const inputClass = 'w-full bg-glass/[0.03] border border-glass/10 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 text-ink-100 transition-colors placeholder:text-ink-400';
const chipClass = (active: boolean) =>
  `px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
    active
      ? 'border-accent-500 bg-accent-500/10 text-accent-400'
      : 'border-glass/10 bg-glass/[0.03] text-ink-400 hover:border-glass/20'
  }`;

export function NewCampaign() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [brandTone, setBrandTone] = useState<BrandTone | ''>('');
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal | ''>('');
  const [ctaPreference, setCtaPreference] = useState<CtaPreference | ''>('');
  const [extraNotes, setExtraNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!product || platforms.length === 0 || !budget) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data: campaign } = await campaignsApi.create({
        target_url_or_product: product,
        target_audience: audience || null,
        key_features: keyFeatures || null,
        brand_tone: brandTone || null,
        campaign_goal: campaignGoal || null,
        cta_preference: ctaPreference || null,
        extra_notes: extraNotes || null,
        platforms,
        daily_budget: Number(budget),
      });
      if (files.length > 0) {
        await campaignsApi.uploadAssets(campaign.id, files);
      }
      // Ajanları görseller (varsa) diskte hazır olduktan sonra tetikliyoruz
      await campaignsApi.start(campaign.id);
      navigate('/app/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kampanya oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Yeni Kampanya" subtitle="Yapay zeka için parametreleri belirleyin.">
      <form onSubmit={submit} className="space-y-4 pb-12">

        {/* Parametre Kutusu */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 p-6 md:p-8 rounded-2xl space-y-7">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-ink-100">
                <Target size={17} strokeWidth={2} className="text-ink-400" />
                <h3 className="text-sm font-semibold">Hedef URL veya Ürün</h3>
              </div>
              <input
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={inputClass}
                placeholder="Örn: https://siteniz.com/urun"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-ink-100">
                <Users size={17} strokeWidth={2} className="text-ink-400" />
                <h3 className="text-sm font-semibold">Hedef Kitle <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
              </div>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className={inputClass}
                placeholder="Örn: 25-40 yaş arası, teknoloji meraklısı kullanıcılar"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <Sparkles size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Öne Çıkan Özellikler <span className="text-ink-400 font-normal">(opsiyonel ama önerilir)</span></h3>
            </div>
            <textarea
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Örn: %100 su geçirmez, 30 saat pil ömrü, ücretsiz kargo, ilk siparişte %20 indirim..."
            />
            <p className="text-xs text-ink-400">Ne kadar somut bilgi verirsen reklamlar o kadar özelleşir; boş bırakırsan ajanlar ürün adından genel bir tahmin yapar.</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <MessageSquarePlus size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Marka Tonu <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {ALL_TONES.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  onClick={() => setBrandTone((prev) => (prev === tone ? '' : tone))}
                  className={chipClass(brandTone === tone)}
                >
                  {BRAND_TONE_LABELS[tone]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-ink-100">
                <Goal size={17} strokeWidth={2} className="text-ink-400" />
                <h3 className="text-sm font-semibold">Kampanya Hedefi <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
              </div>
              <select
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value as CampaignGoal | '')}
                className={inputClass}
              >
                <option value="" className="bg-ink-900">Seçilmedi</option>
                {ALL_GOALS.map((g) => (
                  <option key={g} value={g} className="bg-ink-900">{CAMPAIGN_GOAL_LABELS[g]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-ink-100">
                <MousePointerClick size={17} strokeWidth={2} className="text-ink-400" />
                <h3 className="text-sm font-semibold">Harekete Geçirici Çağrı <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
              </div>
              <select
                value={ctaPreference}
                onChange={(e) => setCtaPreference(e.target.value as CtaPreference | '')}
                className={inputClass}
              >
                <option value="" className="bg-ink-900">Seçilmedi</option>
                {ALL_CTAS.map((c) => (
                  <option key={c} value={c} className="bg-ink-900">{CTA_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <MessageSquarePlus size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Ek İstekler <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Örn: Rakiplerden fiyat avantajımızı vurgula, logomuzun rengi mavi, emoji kullanma..."
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <ImagePlus size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Kendi Görsel/Videolarınız <span className="text-ink-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <p className="text-xs text-ink-400">Ürününüze ait gerçek fotoğraf/video varsa ekleyin; AI'nın ürettiği görsellerin yanında referans olarak saklanır.</p>
            <label className="flex items-center justify-center gap-2 border border-dashed border-glass/15 rounded-lg py-4 text-sm text-ink-400 cursor-pointer hover:border-accent-500/50 transition-colors">
              <ImagePlus size={16} />
              Dosya seç (görsel veya video, en fazla 10 adet)
              <input type="file" multiple accept="image/*,video/*" onChange={onFilesSelected} className="hidden" />
            </label>
            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 bg-glass/[0.03] border border-glass/10 rounded-lg py-2 px-3 text-sm text-ink-100">
                    <span className="flex items-center gap-2 min-w-0">
                      {file.type.startsWith('video/') ? <Film size={14} className="shrink-0 text-ink-400" /> : <ImagePlus size={14} className="shrink-0 text-ink-400" />}
                      <span className="truncate">{file.name}</span>
                    </span>
                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-ink-400 hover:text-rose-400 transition-colors">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <Layers size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Dağıtım Ağları</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {ALL_PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 ${chipClass(active)}`}
                  >
                    <PlatformBadge platform={p} size="sm" />
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-ink-100">
              <Wallet size={17} strokeWidth={2} className="text-ink-400" />
              <h3 className="text-sm font-semibold">Günlük Bütçe (₺)</h3>
            </div>
            <input
              required
              type="number"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`md:max-w-xs ${inputClass}`}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Aksiyon */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-lg px-4 py-3">
            <AlertTriangle size={16} className="shrink-0" /> {error}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !product || platforms.length === 0 || !budget}
            className="flex items-center gap-2 bg-accent-500 text-ink-950 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(51,194,232,0.3)]"
          >
            {submitting ? 'İşleniyor...' : 'Sistemi Başlat'}
            {!submitting && <ArrowRight size={16} strokeWidth={2} />}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
