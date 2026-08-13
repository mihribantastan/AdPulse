import { useEffect, useState } from 'react';
import {
  MousePointerClick, Wallet, TrendingUp, Percent, ArrowUpRight,
  Megaphone, Clock, CheckCircle2, CircleDollarSign, BarChart3, LineChart as LineChartIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/StatCard';
import { EmptyChartState } from '../components/EmptyChartState';
import { useIsDarkMode } from '../hooks/useIsDarkMode';
import { metricsApi } from '../lib/api';
import type { DashboardSummary, TimeseriesPoint, PlatformBreakdownPoint } from '../lib/types';
import { PLATFORM_LABELS, PLATFORM_CHART_COLORS, type Platform } from '../lib/types';

const DAY_LABELS: Record<string, string> = {
  Mon: 'Pzt', Tue: 'Sal', Wed: 'Çar', Thu: 'Per', Fri: 'Cum', Sat: 'Cmt', Sun: 'Paz',
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const en = d.toLocaleDateString('en-US', { weekday: 'short' });
  return DAY_LABELS[en] ?? en;
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [platformData, setPlatformData] = useState<PlatformBreakdownPoint[]>([]);
  const isDark = useIsDarkMode();

  useEffect(() => {
    metricsApi.summary().then(setSummary);
    metricsApi.timeseries().then(setTimeseries);
    metricsApi.byPlatform().then(setPlatformData);
  }, []);

  const pipeline = summary?.pipeline;
  const hasPerf = summary?.has_performance_data ?? false;

  const platformDistribution = (pipeline?.platform_distribution ?? []).map((p) => ({
    platform: p.platform as Platform,
    label: PLATFORM_LABELS[p.platform as Platform] ?? p.platform,
    count: p.count,
    fill: isDark ? PLATFORM_CHART_COLORS[p.platform as Platform]?.dark : PLATFORM_CHART_COLORS[p.platform as Platform]?.light,
  }));

  const accentBlue = isDark ? '#3987e5' : '#2a78d6';
  const accentGreen = isDark ? '#4ade80' : '#15803d';
  const gridColor = isDark ? '#334155' : '#94a3b8';

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
              Yapay zeka modelleri kampanyalarınızı yönetiyor.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {pipeline
                ? `${pipeline.total_campaigns} kampanya oluşturuldu, ${pipeline.approved} tanesi onaylandı. Toplam ₺${pipeline.total_daily_budget.toLocaleString('tr-TR')} günlük bütçe yönetiliyor.`
                : 'Kampanyalarınız yükleniyor...'}
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors relative z-10">
            Detaylı Rapor <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Reklam Performansı */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tıklama"
            value={summary ? summary.clicks.toLocaleString('tr-TR') : '—'}
            hint={!hasPerf ? 'Henüz veri yok' : undefined}
            icon={MousePointerClick}
          />
          <StatCard
            label="Harcama"
            value={summary ? `₺${summary.spend.toLocaleString('tr-TR')}` : '—'}
            hint={!hasPerf ? 'Henüz veri yok' : undefined}
            icon={Wallet}
          />
          <StatCard
            label="Net Kâr"
            value={summary ? `₺${summary.profit.toLocaleString('tr-TR')}` : '—'}
            hint={!hasPerf ? 'Henüz veri yok' : undefined}
            icon={TrendingUp}
          />
          <StatCard
            label="CTR"
            value={summary ? `%${summary.ctr}` : '—'}
            hint={!hasPerf ? 'Henüz veri yok' : undefined}
            icon={Percent}
          />
        </div>

        {/* Kampanya Boru Hattı - bugün gerçekten sahip olduğumuz veri */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Kampanya Boru Hattı</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Toplam Kampanya" value={pipeline ? String(pipeline.total_campaigns) : '—'} icon={Megaphone} />
            <StatCard label="Onay Bekleyen" value={pipeline ? String(pipeline.pending) : '—'} icon={Clock} />
            <StatCard label="Onaylanan" value={pipeline ? String(pipeline.approved) : '—'} icon={CheckCircle2} />
            <StatCard label="Toplam Günlük Bütçe" value={pipeline ? `₺${pipeline.total_daily_budget.toLocaleString('tr-TR')}` : '—'} icon={CircleDollarSign} />
          </div>
        </div>

        {/* Trend Grafikleri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Tıklama Trendi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-6">
              <LineChartIcon size={16} className="text-slate-400" />
              <div>
                <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Tıklama Trendi</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Son 14 gün</p>
              </div>
            </div>
            <div className="h-64">
              {hasPerf ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentBlue} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={accentBlue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={formatDay}
                      formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Tıklama']}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', fontSize: 13 }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area type="monotone" dataKey="clicks" stroke={accentBlue} strokeWidth={2} fill="url(#clicksFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={MousePointerClick}
                  title="Henüz tıklama verisi yok"
                  hint="Kampanyalarınız Google Ads / Meta'da yayına başladığında tıklama trendi burada görünecek."
                />
              )}
            </div>
          </div>

          {/* Harcama & Net Kâr */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Wallet size={16} className="text-slate-400" />
                <div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Harcama</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Son 14 gün, ₺</p>
                </div>
              </div>
            </div>
            <div className="h-64">
              {hasPerf ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentGreen} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={accentGreen} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                      labelFormatter={formatDay}
                      formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Harcama']}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', fontSize: 13 }}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area type="monotone" dataKey="spend" stroke={accentGreen} strokeWidth={2} fill="url(#spendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState
                  icon={Wallet}
                  title="Henüz harcama verisi yok"
                  hint="Gerçek reklam harcaması ve net kâr, kampanyalarınız yayına girdiğinde burada izlenebilecek."
                />
              )}
            </div>
          </div>
        </div>

        {/* Platform Dağılımı - bugün sahip olduğumuz gerçek veri */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <BarChart3 size={16} className="text-slate-400" />
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Platform Dağılımı</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Kampanyaların hedeflediği platformlar</p>
            </div>
          </div>
          <div className="h-56">
            {platformDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformDistribution} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 13, fontWeight: 500, fill: isDark ? '#e2e8f0' : '#334155' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [`${value} kampanya`, 'Sayı']}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, color: '#fff', fontSize: 13 }}
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                    {platformDistribution.map((entry) => (
                      <Cell key={entry.platform} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="count" position="right" style={{ fill: isDark ? '#e2e8f0' : '#334155', fontSize: 12, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState
                icon={BarChart3}
                title="Henüz kampanya yok"
                hint="İlk kampanyanızı oluşturduğunuzda platform dağılımı burada görünecek."
              />
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
