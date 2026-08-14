import { jsPDF } from 'jspdf';
import type { Campaign, CampaignMetricsSummary, CampaignTimeseriesPoint } from './types';
import type { ReportPreferences } from '../hooks/useReportPreferences';

type RGB = [number, number, number];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_H - 22;
const FONT = 'NotoSans';

const INK_900: RGB = [17, 24, 39];
const INK_600: RGB = [75, 85, 99];
const INK_400: RGB = [148, 163, 184];
const LINE: RGB = [226, 232, 240];
const ACCENT: RGB = [24, 147, 179];
const GREEN: RGB = [22, 163, 74];

const STATUS_META: Record<Campaign['approval_status'], { label: string; color: RGB }> = {
  pending: { label: 'Onay Bekliyor', color: [180, 83, 9] },
  approved: { label: 'Yayında', color: [4, 120, 87] },
  rejected: { label: 'Reddedildi', color: [190, 18, 60] },
};

const PLATFORM_LABELS: Record<string, string> = {
  google_ads: 'Google Ads', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', x: 'X (Twitter)',
};

const DAY_LABELS: Record<string, string> = { Mon: 'Pzt', Tue: 'Sal', Wed: 'Çar', Thu: 'Per', Fri: 'Cum', Sat: 'Cmt', Sun: 'Paz' };

function shortDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const en = d.toLocaleDateString('en-US', { weekday: 'short' });
  return DAY_LABELS[en] ?? en;
}

function tl(n: number) {
  return `${n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL`;
}

async function fetchFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadFonts(doc: jsPDF) {
  const base = import.meta.env.BASE_URL;
  const [regular, bold] = await Promise.all([
    fetchFontBase64(`${base}fonts/NotoSans-Regular.ttf`),
    fetchFontBase64(`${base}fonts/NotoSans-Bold.ttf`),
  ]);
  doc.addFileToVFS('NotoSans-Regular.ttf', regular);
  doc.addFont('NotoSans-Regular.ttf', FONT, 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', bold);
  doc.addFont('NotoSans-Bold.ttf', FONT, 'bold');
  doc.setFont(FONT, 'normal');
}

function drawRunningHeader(doc: jsPDF, campaignName: string) {
  doc.setFont(FONT, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text('AdPulse', MARGIN, 12);

  doc.setFont(FONT, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...INK_400);
  const trimmed = campaignName.length > 60 ? campaignName.slice(0, 57) + '...' : campaignName;
  doc.text(trimmed, PAGE_W - MARGIN, 12, { align: 'right' });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, 15, PAGE_W - MARGIN, 15);
}

function drawFooter(doc: jsPDF, pageNum: number) {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
  doc.setFont(FONT, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_400);
  doc.text('AdPulse tarafından oluşturuldu · İnsan onaylı reklam otomasyonu', MARGIN, PAGE_H - 9);
  doc.text(`Sayfa ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 9, { align: 'right' });
}

function drawKpiGrid(doc: jsPDF, x: number, y: number, width: number, items: { label: string; value: string }[]) {
  const cols = 3;
  const rows = Math.ceil(items.length / cols);
  const cellW = width / cols;
  const cellH = 22;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.25);

  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = x + col * cellW;
    const cy = y + row * cellH;
    doc.rect(cx, cy, cellW, cellH, 'S');

    doc.setFont(FONT, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_600);
    doc.text(item.label, cx + 5, cy + 8);

    doc.setFont(FONT, 'bold');
    doc.setFontSize(13.5);
    doc.setTextColor(...INK_900);
    doc.text(item.value, cx + 5, cy + 17);
  });

  return y + rows * cellH;
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, title: string, subtitle?: string) {
  doc.setFont(FONT, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK_900);
  doc.text(title, x, y);
  if (subtitle) {
    doc.setFont(FONT, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK_400);
    doc.text(subtitle, x, y + 5);
  }
}

function drawLineChart(
  doc: jsPDF,
  opts: {
    x: number; y: number; width: number; height: number;
    series: { color: RGB; values: number[] }[];
    xLabels: string[];
  },
) {
  const { x, y, width, height, series, xLabels } = opts;
  const plotH = height;
  const plotBottom = y + plotH;
  const maxVal = Math.max(...series.flatMap((s) => s.values), 1);
  const n = xLabels.length;
  const stepX = width / (n - 1);

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  const gridCount = 4;
  for (let g = 0; g <= gridCount; g++) {
    const gy = plotBottom - (plotH * g) / gridCount;
    doc.line(x, gy, x + width, gy);
    const val = (maxVal * g) / gridCount;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...INK_400);
    doc.text(Math.round(val).toLocaleString('tr-TR'), x - 2, gy + 1, { align: 'right' });
  }

  series.forEach((s) => {
    doc.setDrawColor(...s.color);
    doc.setLineWidth(0.7);
    for (let i = 0; i < n - 1; i++) {
      const x1 = x + i * stepX;
      const y1 = plotBottom - (s.values[i] / maxVal) * plotH;
      const x2 = x + (i + 1) * stepX;
      const y2 = plotBottom - (s.values[i + 1] / maxVal) * plotH;
      doc.line(x1, y1, x2, y2);
    }
    doc.setFillColor(...s.color);
    for (let i = 0; i < n; i++) {
      const xi = x + i * stepX;
      const yi = plotBottom - (s.values[i] / maxVal) * plotH;
      doc.circle(xi, yi, 0.7, 'F');
    }
  });

  doc.setFont(FONT, 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_400);
  xLabels.forEach((lbl, i) => {
    if (n > 10 && i % 2 !== 0) return; // kalabalık olmasın diye her ikinci etiketi atla
    const xi = x + i * stepX;
    doc.text(lbl, xi, plotBottom + 5, { align: 'center' });
  });
}

function drawLegend(doc: jsPDF, x: number, y: number, items: { color: RGB; label: string }[]) {
  let cx = x;
  items.forEach((item) => {
    doc.setFillColor(...item.color);
    doc.circle(cx, y - 1, 1, 'F');
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_600);
    doc.text(item.label, cx + 3, y);
    cx += doc.getTextWidth(item.label) + 12;
  });
}

export async function generateCampaignReportPdf({
  campaign,
  summary,
  timeseries,
  prefs,
}: {
  campaign: Campaign;
  summary: CampaignMetricsSummary;
  timeseries: CampaignTimeseriesPoint[];
  prefs: ReportPreferences;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  await loadFonts(doc);

  let pageNum = 1;
  let y = 24;

  drawRunningHeader(doc, campaign.target_url_or_product);

  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM_LIMIT) {
      drawFooter(doc, pageNum);
      doc.addPage();
      pageNum += 1;
      drawRunningHeader(doc, campaign.target_url_or_product);
      y = 24;
    }
  };

  // Başlık bloğu
  const status = STATUS_META[campaign.approval_status];
  doc.setFillColor(...status.color);
  doc.roundedRect(MARGIN, y, 28, 6, 1.5, 1.5, 'F');
  doc.setFont(FONT, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(status.label, MARGIN + 14, y + 4, { align: 'center' });

  doc.setFont(FONT, 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...INK_900);
  const titleLines = doc.splitTextToSize(campaign.target_url_or_product, CONTENT_W);
  doc.text(titleLines, MARGIN, y + 15);
  y += 15 + titleLines.length * 6;

  const platformText = campaign.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(' · ');
  doc.setFont(FONT, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_600);
  doc.text(`${platformText}  ·  Günlük bütçe ${tl(campaign.daily_budget)}  ·  Son 14 gün`, MARGIN, y + 2);
  y += 12;

  // KPI ızgarası
  ensureSpace(48);
  const kpiItems = [
    { label: 'Harcama', value: tl(summary.spend) },
    { label: 'Tıklama', value: summary.clicks.toLocaleString('tr-TR') },
    { label: 'Gösterim', value: summary.impressions.toLocaleString('tr-TR') },
    { label: 'CTR', value: `%${summary.ctr}` },
    { label: 'Dönüşüm', value: String(summary.conversions) },
    { label: 'Net Kâr', value: tl(summary.profit) },
  ];
  y = drawKpiGrid(doc, MARGIN, y, CONTENT_W, kpiItems) + 12;

  if (!summary.has_performance_data) {
    ensureSpace(20);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK_400);
    doc.text('Bu kampanya için henüz performans verisi bulunmuyor.', MARGIN, y + 4);
    y += 16;
  } else {
    const xLabels = timeseries.map((t) => shortDay(t.date));

    if (prefs.clicksChart) {
      ensureSpace(66);
      drawSectionTitle(doc, MARGIN, y, 'Tıklama Trendi', 'Son 14 gün');
      drawLineChart(doc, {
        x: MARGIN + 10, y: y + 12, width: CONTENT_W - 10, height: 32,
        series: [{ color: ACCENT, values: timeseries.map((t) => t.clicks) }],
        xLabels,
      });
      y += 60;
    }

    if (prefs.spendRevenueChart) {
      ensureSpace(66);
      drawSectionTitle(doc, MARGIN, y, 'Harcama & Gelir', 'Son 14 gün, TL');
      drawLegend(doc, PAGE_W - MARGIN - 45, y, [
        { color: ACCENT, label: 'Harcama' },
        { color: GREEN, label: 'Gelir' },
      ]);
      drawLineChart(doc, {
        x: MARGIN + 10, y: y + 12, width: CONTENT_W - 10, height: 32,
        series: [
          { color: ACCENT, values: timeseries.map((t) => t.spend) },
          { color: GREEN, values: timeseries.map((t) => t.revenue) },
        ],
        xLabels,
      });
      y += 60;
    }
  }

  if (prefs.strategyBrief && campaign.ai_analysis_results?.strategy_brief) {
    const brief = campaign.ai_analysis_results.strategy_brief.replace(/^#+\s*/gm, '').replace(/\*\*/g, '');
    ensureSpace(16);
    drawSectionTitle(doc, MARGIN, y, 'AI Strateji Özeti');
    y += 10;

    doc.setFont(FONT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK_600);
    const lines = doc.splitTextToSize(brief, CONTENT_W);
    const lineHeight = 4.8;
    for (const line of lines) {
      if (y + lineHeight > BOTTOM_LIMIT) {
        drawFooter(doc, pageNum);
        doc.addPage();
        pageNum += 1;
        drawRunningHeader(doc, campaign.target_url_or_product);
        y = 24;
      }
      doc.text(line, MARGIN, y);
      y += lineHeight;
    }
  }

  drawFooter(doc, pageNum);

  const safeName = campaign.target_url_or_product.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  doc.save(`${safeName || 'kampanya'}-rapor.pdf`);
}
