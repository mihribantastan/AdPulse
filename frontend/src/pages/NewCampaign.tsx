import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Wallet, Layers } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { campaignsApi } from '../lib/api';
import type { Platform } from '../lib/types';
import { PLATFORM_LABELS } from '../lib/types';

const ALL_PLATFORMS: Platform[] = ['google_ads', 'instagram', 'facebook', 'youtube', 'tiktok', 'x'];

export function NewCampaign() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || platforms.length === 0 || !budget) return;
    setSubmitting(true);
    try {
      await campaignsApi.create({ target_url_or_product: product, target_audience: audience, platforms, daily_budget: Number(budget) });
      navigate('/app/campaigns');
    } catch {
      navigate('/app/campaigns');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Yeni Oluştur" subtitle="Yapay zeka için parametreleri belirleyin.">
      <form onSubmit={submit} className="max-w-3xl space-y-6 pb-12">
        
        {/* Parametre Kutusu */}
        <div className="bg-frankie-card border border-frankie-border p-8 rounded-[2rem] space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-frankie-text">
              <Target size={18} strokeWidth={1.5} className="text-frankie-muted" />
              <h3 className="text-lg font-medium">Hedef URL veya Ürün</h3>
            </div>
            <input
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full bg-frankie-hover border border-frankie-border rounded-xl py-3 px-4 text-sm outline-none focus:border-[#444444] text-frankie-text transition-colors placeholder:text-frankie-muted"
              placeholder="Örn: https://siteniz.com/urun"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-frankie-text">
              <Layers size={18} strokeWidth={1.5} className="text-frankie-muted" />
              <h3 className="text-lg font-medium">Dağıtım Ağları</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                      active
                        ? 'border-frankie-text bg-frankie-text text-black'
                        : 'border-frankie-border bg-frankie-hover text-frankie-muted hover:text-frankie-text'
                    }`}
                  >
                    <PlatformBadge platform={p} size="sm" />
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-frankie-text">
              <Wallet size={18} strokeWidth={1.5} className="text-frankie-muted" />
              <h3 className="text-lg font-medium">Günlük Bütçe (₺)</h3>
            </div>
            <input
              required
              type="number"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full md:max-w-xs bg-frankie-hover border border-frankie-border rounded-xl py-3 px-4 text-sm outline-none focus:border-[#444444] text-frankie-text transition-colors placeholder:text-frankie-muted"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Aksiyon */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !product || platforms.length === 0 || !budget}
            className="flex items-center gap-2 bg-frankie-text text-black px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white transition-colors disabled:opacity-50"
          >
            {submitting ? 'İşleniyor...' : 'Sistemi Başlat'}
            {!submitting && <ArrowRight size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}