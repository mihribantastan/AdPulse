import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Users, Wallet, Layers, Sparkles, MessageSquarePlus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { BrandTone, Platform } from '../lib/types';
import { BRAND_TONE_LABELS, PLATFORM_LABELS } from '../lib/types';

const ALL_PLATFORMS: Platform[] = ['google_ads', 'instagram', 'facebook', 'youtube', 'tiktok', 'x'];
const ALL_TONES: BrandTone[] = ['profesyonel', 'samimi', 'eglenceli', 'lux', 'enerjik'];

export function NewCampaign() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [brandTone, setBrandTone] = useState<BrandTone | ''>('');
  const [extraNotes, setExtraNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!product || platforms.length === 0 || !budget) return;
    setSubmitting(true);
    try {
      await campaignsApi.create({
        target_url_or_product: product,
        target_audience: audience || null,
        key_features: keyFeatures || null,
        brand_tone: brandTone || null,
        extra_notes: extraNotes || null,
        platforms,
        daily_budget: Number(budget),
      });
      navigate('/app/campaigns');
    } catch {
      navigate('/app/campaigns');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Yeni Oluştur" subtitle="Yapay zeka için parametreleri belirleyin.">
      <form onSubmit={submit} className="max-w-2xl space-y-4 pb-12">

        {/* Parametre Kutusu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl space-y-7">

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Target size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Hedef URL veya Ürün</h3>
            </div>
            <input
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
              placeholder="Örn: https://siteniz.com/urun"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Users size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Hedef Kitle <span className="text-slate-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
              placeholder="Örn: 25-40 yaş arası, teknoloji meraklısı kullanıcılar"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Sparkles size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Öne Çıkan Özellikler <span className="text-slate-400 font-normal">(opsiyonel ama önerilir)</span></h3>
            </div>
            <textarea
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 resize-none"
              placeholder="Örn: %100 su geçirmez, 30 saat pil ömrü, ücretsiz kargo, ilk siparişte %20 indirim..."
            />
            <p className="text-xs text-slate-400">Ne kadar somut bilgi verirsen reklamlar o kadar özelleşir; boş bırakırsan ajanlar ürün adından genel bir tahmin yapar.</p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <MessageSquarePlus size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Marka Tonu <span className="text-slate-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {ALL_TONES.map((tone) => (
                <button
                  type="button"
                  key={tone}
                  onClick={() => setBrandTone((prev) => (prev === tone ? '' : tone))}
                  className={`px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    brandTone === tone
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {BRAND_TONE_LABELS[tone]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <MessageSquarePlus size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Ek İstekler <span className="text-slate-400 font-normal">(opsiyonel)</span></h3>
            </div>
            <textarea
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 resize-none"
              placeholder="Örn: Rakiplerden fiyat avantajımızı vurgula, logomuzun rengi mavi, emoji kullanma..."
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Layers size={17} strokeWidth={2} className="text-slate-400" />
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
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <PlatformBadge platform={p} size="sm" />
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <Wallet size={17} strokeWidth={2} className="text-slate-400" />
              <h3 className="text-sm font-semibold">Günlük Bütçe (₺)</h3>
            </div>
            <input
              required
              type="number"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full md:max-w-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-4 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Aksiyon */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !product || platforms.length === 0 || !budget}
            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'İşleniyor...' : 'Sistemi Başlat'}
            {!submitting && <ArrowRight size={16} strokeWidth={2} />}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
