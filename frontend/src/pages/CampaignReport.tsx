import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Download, Wallet, MousePointerClick, Eye, Percent, TrendingUp, Target,
  LineChart as LineChartIcon, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout';
import { PlatformBadge } from '../components/PlatformBadge';
import { StripStat } from '../components/StripStat';
import { EmptyChartState } from '../components/EmptyChartState';
import { useReportPreferences } from '../hooks/useReportPreferences';
import { campaignsApi, metricsApi } from '../lib/api';
import { generateCampaignReportPdf } from '../lib/reportPdf';
import type { Campaign, CampaignMetricsSummary, CampaignTimeseriesPoint } from '../lib/types';

const STATUS_STYLE: Record<Campaign['approval_status'], { label: string; className: string }> = {
  pending: { label: 'Onay Bekliyor', className: 'bg-amber-500/10 text-amber-400' },
  approved: { label: 'Yayında', className: 'bg-emerald-500/10 text-emerald-400' },
  rejected: { label: 'Reddedildi', className: 'bg-rose-500/10 text-rose-400' },
};

const DAY_LABELS: Record<string, string> = {
  Mon: 'Pzt', Tue: 'Sal', Wed: 'Çar', Thu: 'Per', Fri: 'Cum', Sat: 'Cmt', Sun: 'Paz',
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const en = d.toLocaleDateString('en-US', { weekday: 'short' });
  return DAY_LABELS[en] ?? en;
}

const accentCyan = '#33C2E8';
const accentGreen = '#4ade80';
const gridColor = '#334155';
const tooltipStyle = { backgroundColor: '#12141B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#F1F3F7', fontSize: 13 };

export function CampaignReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { prefs } = useReportPreferences();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [summary, setSummary] = useState<CampaignMetricsSummary | null>(null);
  const [timeseries, setTimeseries] = useState<CampaignTimeseriesPoint[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    campaignsApi.get(id).then(setCampaign);
    metricsApi.campaignSummary(id).then(setSummary);
    metricsApi.campaignTimeseries(id).then(setTimeseries);
  }, [id]);

  const handleDownload = async () => {
    if (!campaign || !summary) return;
    setDownloading(true);
    try {
      await generateCampaignReportPdf({ campaign, summary, timeseries, prefs });
    } finally {
      setDownloading(false);
    }
  };

  if (!campaign || !summary) {
    return (
      <AppLayout title="Rapor" subtitle="Yükleniyor...">
        <div className="text-ink-400 text-sm">Yükleniyor...</div>
      </AppLayout>
    );
  }

  const status = STATUS_STYLE[campaign.approval_status];
  const hasPerf = summary.has_performance_data;
  const brief = campaign.ai_analysis_results?.strategy_brief;

  return (
    <AppLayout title="Kampanya Raporu" subtitle="Performans, harcama ve strateji özeti.">
      <div className="space-y-4 pb-12">

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => navigate('/app/reports')}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-ink-100 transition-colors"
          >
            <ArrowLeft size={15} /> Raporlara dön
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-accent-500 text-ink-950 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent-400 transition-colors disabled:opacity-50 shadow-[0_0_16px_rgba(51,194,232,0.25)]"
          >
            <Download size={16} /> {downloading ? 'Hazırlanıyor...' : 'PDF olarak indir'}
          </button>
        </div>

        <div className="space-y-4">

          {/* Başlık */}
          <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 flex flex-wrap items-center gap-4">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${status.className}`}>{status.label}</span>
            <h2 className="font-display text-xl text-ink-100">{campaign.target_url_or_product}</h2>
            <div className="flex items-center gap-1.5 ml-auto">
              {campaign.platforms.map((p) => <PlatformBadge key={p} platform={p} size="sm" />)}
            </div>
          </div>

          {/* KPI Şeridi */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-glass/10 bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl overflow-hidden">
            <StripStat icon={Wallet} label="Harcama" value={`₺${summary.spend.toLocaleString('tr-TR')}`} />
            <StripStat icon={MousePointerClick} label="Tıklama" value={summary.clicks.toLocaleString('tr-TR')} />
            <StripStat icon={Eye} label="Gösterim" value={summary.impressions.toLocaleString('tr-TR')} />
            <StripStat icon={Percent} label="CTR" value={`%${summary.ctr}`} />
            <StripStat icon={Target} label="Dönüşüm" value={String(summary.conversions)} />
            <StripStat icon={TrendingUp} label="Net Kâr" value={`₺${summary.profit.toLocaleString('tr-TR')}`} />
          </div>

          {/* Tıklama Trendi */}
          {prefs.clicksChart && (
            <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <LineChartIcon size={16} className="text-ink-400" />
                <div>
                  <h4 className="font-display text-base text-ink-100 tracking-tight">Tıklama Trendi</h4>
                  <p className="text-sm text-ink-400 mt-0.5">Son 14 gün</p>
                </div>
              </div>
              <div className="h-56">
                {hasPerf ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="reportClicksFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={accentCyan} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={accentCyan} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                      <Tooltip labelFormatter={formatDay} formatter={(v: number) => [v.toLocaleString('tr-TR'), 'Tıklama']} contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="clicks" stroke={accentCyan} strokeWidth={2} fill="url(#reportClicksFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState icon={MousePointerClick} title="Henüz tıklama verisi yok" hint="Kampanya yayına başladığında burada görünecek." />
                )}
              </div>
            </div>
          )}

          {/* Harcama & Gelir */}
          {prefs.spendRevenueChart && (
            <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <Wallet size={16} className="text-ink-400" />
                  <div>
                    <h4 className="font-display text-base text-ink-100 tracking-tight">Harcama & Gelir</h4>
                    <p className="text-sm text-ink-400 mt-0.5">Son 14 gün, ₺</p>
                  </div>
                </div>
                {hasPerf && (
                  <div className="flex items-center gap-4 text-xs text-ink-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: accentCyan }} /> Harcama</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: accentGreen }} /> Gelir</span>
                  </div>
                )}
              </div>
              <div className="h-56">
                {hasPerf ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeseries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="date" tickFormatter={formatDay} tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fontWeight: 500, fill: gridColor }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip labelFormatter={formatDay} formatter={(v: number, name) => [`₺${v.toLocaleString('tr-TR')}`, name === 'spend' ? 'Harcama' : 'Gelir']} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="spend" stroke={accentCyan} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="revenue" stroke={accentGreen} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartState icon={Wallet} title="Henüz harcama verisi yok" hint="Kampanya yayına başladığında burada görünecek." />
                )}
              </div>
            </div>
          )}

          {/* AI Strateji Özeti */}
          {prefs.strategyBrief && brief && (
            <div className="bg-glass/[0.03] backdrop-blur-xl border border-glass/10 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <FileText size={16} className="text-ink-400" />
                <h4 className="font-display text-base text-ink-100 tracking-tight">AI Strateji Özeti</h4>
              </div>
              <p className="text-sm text-ink-400 whitespace-pre-line leading-relaxed">
                {brief.replace(/^#+\s*/gm, '').replace(/\*\*/g, '')}
              </p>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
