import { useEffect, useState } from 'react';
import { MousePointerClick, Wallet, TrendingUp, Percent, ArrowUpRight } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/StatCard';
import { campaignsApi, metricsApi } from '../lib/api';
import type { DashboardSummary } from '../lib/types';

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    metricsApi.summary().then(setSummary);
  }, []);

  return (
    <AppLayout title="Genel Bakış" subtitle="Sistem metrikleri ve güncel durum.">
      <div className="space-y-4 pb-12">
        
        {/* Ana Karşılama Kutusu */}
        <div className="bg-frankie-card border border-frankie-border rounded-3xl p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-5 max-w-xl">
            <div className="inline-block px-3 py-1.5 rounded-full bg-frankie-bg border border-frankie-border text-[10px] font-bold uppercase tracking-widest text-frankie-muted">
              Sistem Aktif
            </div>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-frankie-text leading-tight">
              Yapay zeka modelleri bütçenizi yönetiyor.
            </h2>
            <p className="text-frankie-muted font-light leading-relaxed text-sm md:text-base">
              Tüm kampanyalar analiz edildi. Kaynak kullanımı geçen haftaya göre %12 daha verimli hale getirildi.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-frankie-accent text-white px-6 py-3.5 rounded-full font-medium text-sm hover:opacity-90 transition-opacity shadow-md">
            Detaylı Rapor <ArrowUpRight size={16} />
          </button>
        </div>

        {/* 4'lü Küçük Kutular */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-frankie-card border border-frankie-border p-6 rounded-3xl shadow-sm">
            <StatCard label="Tıklama" value={summary ? summary.clicks.toLocaleString('tr-TR') : '—'} delta="+12.4%" icon={MousePointerClick} />
          </div>
          <div className="bg-frankie-card border border-frankie-border p-6 rounded-3xl shadow-sm">
            <StatCard label="Harcama" value={summary ? `₺${summary.spend.toLocaleString('tr-TR')}` : '—'} delta="-4.1%" positive={false} icon={Wallet} />
          </div>
          <div className="bg-frankie-card border border-frankie-border p-6 rounded-3xl shadow-sm">
            <StatCard label="Net Kâr" value={summary ? `₺${summary.profit.toLocaleString('tr-TR')}` : '—'} delta="+18.9%" icon={TrendingUp} />
          </div>
          <div className="bg-frankie-card border border-frankie-border p-6 rounded-3xl shadow-sm">
            <StatCard label="CTR" value={summary ? `%${summary.ctr}` : '—'} delta="+0.4pp" icon={Percent} />
          </div>
        </div>
        
      </div>
    </AppLayout>
  );
}