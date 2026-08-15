import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointerClick, Wallet, TrendingUp, Percent, ArrowUpRight, ArrowRight,
  Megaphone, CheckCircle2, CircleDollarSign, BarChart3, LineChart as LineChartIcon, ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/StatCard';
import { StripStat } from '../components/StripStat';
import { EmptyChartState } from '../components/EmptyChartState';
import { PlatformBadge } from '../components/PlatformBadge';
import { metricsApi, campaignsApi } from '../lib/api';
import type { Campaign, DashboardSummary, TimeseriesPoint } from '../lib/types';
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
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    metricsApi.summary().then(setSummary);
    metricsApi.timeseries().then(setTimeseries);
    campaignsApi.list().then(setCampaigns);
  }, []);

  const pipeline = summary?.pipeline;
  const hasPerf = summary?.has_performance_data ?? false;
  const pendingCampaigns = campaigns.filter((c) => c.approval_status === 'pending').slice(0, 3);

  const platformDistribution = (pipeline?.platform_distribution ?? []).map((p) => ({
    platform: p.platform as Platform,
    label: PLATFORM_LABELS[p.platform as Platform] ?? p.platform,
    count: p.count,
    fill: PLATFORM_CHART_COLORS[p.platform as Platform]?.dark,
  }));

  const accentCyan = '#33C2E8';
  const accentGreen = '#4ade80';
  const gridColor = '#334155';
  const tooltipStyle = { backgroundColor: '#12141B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F7', fontSize: 13 };

  return (
    <AppLayout title="Genel Bakış" subtitle="Sistem metrikleri ve güncel durum.">
      <div className="space-y-4 pb-12">

        {/* Hero + Onay çağrısı */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-glass/[0.03] backdrop-blur-xl border border-glass/10 text-ink-100 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div
              className="pointer-events-none absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-30 blur-[90px]"
              style={{ background: 'radial-gradient(circle, #33C2E8 0%, transparent 70%)' }}
            />
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            <div className="space-y-4 max-w-xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass/[0.06] border border-glass/10 text-xs font-medium text-ink-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Sistem Aktif
              </div>
              <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug text-balance">
                Yapay zeka modelleri kampanyalarınızı yönetiyor.
              </h2>
              <p className="text-ink-400 text-sm leading-relaxed">
                {pipeline
                  ? `${pipeline.total_campaigns} kampanya oluşturuldu, ${pipeline.approved} tanesi onaylandı. Toplam ₺${pipeline.total_daily_budget.toLocaleString('tr-TR')} günlük bütçe yönetiliyor.`
                  : 'Kampanyalarınız yükleniyor...'}
              </p>
            </div>
            <button className="shrink-0 flex items-center gap-2 bg-accent-500 text-ink-950 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors relative z-10 shadow-[0_0_20px_rgba(51,194,232,0.3)]">
              Detaylı Rapor <ArrowUpRight size={16} />
            </button>
          </div>

          {/* Onay Merkezi çağrısı - ağır vurgulu, tabloya gömülmemiş */}
          <button
            onClick={() => navigate('/app/campaigns')}
            className="lg:col-span-4 text-left relative overflow-hidden rounded-2xl bg-accent-500/[0.07] border-2 border-accent-500/30 p-6 flex flex-col justify-between hover:border-accent-500/50 hover:bg-accent-500/[0.1] transition-colors group"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center text-accent-400 mb-4">
                <ShieldCheck size={19} strokeWidth={2} />
              </div>
              <p className="text-xs font-mono uppercase tracking-wide text-accent-400 mb-1.5">Onay Merkezi</p>
              <p className="font-display text-xl text-ink-100 leading-snug">
                {pipeline ? `${pipeline.pending} taslak inceleme bekliyor` : 'Yükleniyor...'}
              </p>
            </div>

            {pendingCampaigns.length > 0 ? (
              <div className="mt-5 space-y-2">
                {pendingCampaigns.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm text-ink-100 bg-glass/[0.04] border border-glass/10 rounded-lg px-3 py-2">
                    <div className="flex gap-1 shrink-0">
                      {c.platforms.slice(0, 2).map((p) => <PlatformBadge key={p} platform={p} size="sm" />)}
                    </div>
                    <span className="truncate flex-1">{c.target_url_or_product}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-ink-400">Bekleyen taslak yok — her şey onaylanmış.</p>
            )}

            <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-accent-400 group-hover:gap-2.5 transition-all">
              İncele <ArrowRight size={15} />
            </div>
          </button>
        </div>

        {/* Reklam Performansı - şerit */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-glass/10 bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl overflow-hidden">
          <StripStat icon={MousePointerClick} label="Tıklama" value={summary ? summary.clicks.toLocaleString('tr-TR') : '—'} hint={!hasPerf ? 'Henüz veri yok' : undefined} />
          <StripStat icon={Wallet} label="Harcama" value={summary ? `₺${summary.spend.toLocaleString('tr-TR')}` : '—'} hint={!hasPerf ? 'Henüz veri yok' : undefined} />
          <StripStat icon={TrendingUp} label="Net Kâr" value={summary ? `₺${summary.profit.toLocaleString('tr-TR')}` : '—'} hint={!hasPerf ? 'Henüz veri yok' : undefined} />
          <StripStat icon={Percent} label="CTR" value={summary ? `%${summary.ctr}` : '—'} hint={!hasPerf ? 'Henüz veri yok' : undefined} />
        </div>

        {/* Kampanya Boru Hattı */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Toplam Kampanya" value={pipeline ? String(pipeline.total_campaigns) : '—'} icon={Megaphone} />
          <StatCard label="Onaylanan" value={pipeline ? String(pipeline.approved) : '—'} icon={CheckCircle2} />
          <StatCard label="Toplam Günlük Bütçe" value={pipeline ? `₺${pipeline.total_daily_budget.toLocaleString('tr-TR')}` : '—'} icon={CircleDollarSign} />
        </div>

        {/* Trend Grafikleri - asimetrik */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Tıklama Trendi - öne çıkan */}
          <div className="lg:col-span-7 bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-6">
              <LineChartIcon size={16} className="text-ink-400" />
              <div>
                <h4 className="font-display text-base text-ink-100 tracking-tight">Tıklama Trendi</h4>
                <p className="text-sm text-ink-400 mt-0.5">Son 14 gün</p>
              </div>
            </div>
            <div className="h-64">
              {hasPerf ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentCyan} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={accentCyan} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={formatDay}
                      formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Tıklama']}
                      contentStyle={tooltipStyle}
                      labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area type="monotone" dataKey="clicks" stroke={accentCyan} strokeWidth={2} fill="url(#clicksFill)" />
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

          {/* Platform Dağılımı */}
          <div className="lg:col-span-5 bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-6">
              <BarChart3 size={16} className="text-ink-400" />
              <div>
                <h4 className="font-display text-base text-ink-100 tracking-tight">Platform Dağılımı</h4>
                <p className="text-sm text-ink-400 mt-0.5">Hedeflenen platformlar</p>
              </div>
            </div>
            <div className="h-56">
              {platformDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformDistribution} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 13, fontWeight: 500, fill: '#e2e8f0' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => [`${value} kampanya`, 'Sayı']}
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {platformDistribution.map((entry) => (
                        <Cell key={entry.platform} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="count" position="right" style={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} />
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

        {/* Harcama & Net Kâr - tam genişlik */}
        <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Wallet size={16} className="text-ink-400" />
              <div>
                <h4 className="font-display text-base text-ink-100 tracking-tight">Harcama</h4>
                <p className="text-sm text-ink-400 mt-0.5">Son 14 gün, ₺</p>
              </div>
            </div>
          </div>
          <div className="h-48">
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
                    contentStyle={tooltipStyle}
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
    </AppLayout>
  );
}
