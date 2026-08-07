import { useEffect, useState } from 'react';
import { MousePointerClick, Wallet, TrendingUp, Percent, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/StatCard';
import { metricsApi } from '../lib/api';
import type { DashboardSummary } from '../lib/types';

const TREND_DATA = [
  { day: 'Pzt', harcama: 1450, tiklama: 2800 },
  { day: 'Sal', harcama: 1620, tiklama: 3100 },
  { day: 'Çar', harcama: 1380, tiklama: 2950 },
  { day: 'Per', harcama: 1790, tiklama: 3600 },
  { day: 'Cum', harcama: 2050, tiklama: 4200 },
  { day: 'Cmt', harcama: 1920, tiklama: 3980 },
  { day: 'Paz', harcama: 2210, tiklama: 4550 },
];

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    metricsApi.summary().then(setSummary);
  }, []);

  return (
    <AppLayout title="Genel Bakış" subtitle="Sistem metrikleri ve güncel durum.">
      <div className="space-y-4 pb-12">

        {/* Ana Karşılama Kutusu */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-slate-900 dark:border dark:border-slate-800 text-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="space-y-4 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Sistem Aktif
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
              Yapay zeka modelleri bütçenizi yönetiyor.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tüm kampanyalar analiz edildi. Kaynak kullanımı geçen haftaya göre %12 daha verimli hale getirildi.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors relative z-10">
            Detaylı Rapor <ArrowUpRight size={16} />
          </button>
        </div>

        {/* 4'lü Küçük Kutular */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tıklama" value={summary ? summary.clicks.toLocaleString('tr-TR') : '—'} delta="+12.4%" icon={MousePointerClick} />
          <StatCard label="Harcama" value={summary ? `₺${summary.spend.toLocaleString('tr-TR')}` : '—'} delta="-4.1%" positive={false} icon={Wallet} />
          <StatCard label="Net Kâr" value={summary ? `₺${summary.profit.toLocaleString('tr-TR')}` : '—'} delta="+18.9%" icon={TrendingUp} />
          <StatCard label="CTR" value={summary ? `%${summary.ctr}` : '—'} delta="+0.4pp" icon={Percent} />
        </div>

        {/* Trend Grafiği */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Haftalık Performans</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Harcama ve tıklama trendi</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span> Harcama
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span> Tıklama
              </span>
            </div>
          </div>
          <div className="h-72 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="harcamaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tiklamaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', fontSize: 13 }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="harcama" stroke="#2563eb" strokeWidth={2} fill="url(#harcamaFill)" />
                <Area type="monotone" dataKey="tiklama" stroke="#94a3b8" strokeWidth={2} fill="url(#tiklamaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
