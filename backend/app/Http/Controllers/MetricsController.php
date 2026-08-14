<?php

namespace App\Http\Controllers;

use App\Domains\Campaign\Models\Campaign;
use App\Domains\Campaign\Models\CampaignMetric;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MetricsController extends Controller
{
    // Genel bakış: gerçek reklam performansı (Meta/Google senkronize etmeye başlayınca dolacak)
    // + bugün elimizde olan gerçek kampanya boru hattı istatistikleri - sadece giriş yapan kullanıcının
    public function summary(Request $request)
    {
        $userId = $request->user()->id;

        $totals = CampaignMetric::whereHas('campaign', fn ($q) => $q->where('user_id', $userId))
            ->selectRaw('
                COALESCE(SUM(clicks), 0) as clicks,
                COALESCE(SUM(impressions), 0) as impressions,
                COALESCE(SUM(spend), 0) as spend,
                COALESCE(SUM(revenue), 0) as revenue
            ')->first();

        $hasPerformanceData = CampaignMetric::whereHas('campaign', fn ($q) => $q->where('user_id', $userId))->exists();
        $ctr = $totals->impressions > 0 ? round(($totals->clicks / $totals->impressions) * 100, 2) : 0;

        return response()->json([
            'clicks' => (int) $totals->clicks,
            'spend' => (float) $totals->spend,
            'profit' => (float) ($totals->revenue - $totals->spend),
            'ctr' => $ctr,
            'has_performance_data' => $hasPerformanceData,
            'pipeline' => $this->pipelineStats($userId),
        ]);
    }

    // Son 14 günün tıklama/harcama trendi (eksik günler 0 ile dolduruluyor, grafik sürekli olsun diye)
    public function timeseries(Request $request)
    {
        $userId = $request->user()->id;
        $since = Carbon::today()->subDays(13);

        $rows = CampaignMetric::whereHas('campaign', fn ($q) => $q->where('user_id', $userId))
            ->selectRaw('date, SUM(clicks) as clicks, SUM(spend) as spend')
            ->where('date', '>=', $since->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => $row->date->toDateString());

        $series = [];
        for ($i = 0; $i < 14; $i++) {
            $date = $since->copy()->addDays($i)->toDateString();
            $row = $rows->get($date);
            $series[] = [
                'date' => $date,
                'clicks' => $row ? (int) $row->clicks : 0,
                'spend' => $row ? (float) $row->spend : 0,
            ];
        }

        return response()->json($series);
    }

    // Tek bir kampanyanın toplam performansı - rapor sayfası için
    public function campaignSummary(Request $request, Campaign $campaign)
    {
        abort_unless($campaign->user_id === $request->user()->id, 403);

        $totals = CampaignMetric::where('campaign_id', $campaign->id)
            ->selectRaw('
                COALESCE(SUM(clicks), 0) as clicks,
                COALESCE(SUM(impressions), 0) as impressions,
                COALESCE(SUM(spend), 0) as spend,
                COALESCE(SUM(revenue), 0) as revenue,
                COALESCE(SUM(conversions), 0) as conversions
            ')->first();

        $hasPerformanceData = CampaignMetric::where('campaign_id', $campaign->id)->exists();
        $ctr = $totals->impressions > 0 ? round(($totals->clicks / $totals->impressions) * 100, 2) : 0;

        return response()->json([
            'clicks' => (int) $totals->clicks,
            'impressions' => (int) $totals->impressions,
            'spend' => (float) $totals->spend,
            'revenue' => (float) $totals->revenue,
            'profit' => (float) ($totals->revenue - $totals->spend),
            'conversions' => (int) $totals->conversions,
            'ctr' => $ctr,
            'has_performance_data' => $hasPerformanceData,
        ]);
    }

    // Tek bir kampanyanın son 14 günlük trendi - rapor sayfası için
    public function campaignTimeseries(Request $request, Campaign $campaign)
    {
        abort_unless($campaign->user_id === $request->user()->id, 403);

        $since = Carbon::today()->subDays(13);

        $rows = CampaignMetric::where('campaign_id', $campaign->id)
            ->selectRaw('date, SUM(clicks) as clicks, SUM(spend) as spend, SUM(impressions) as impressions, SUM(revenue) as revenue')
            ->where('date', '>=', $since->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => $row->date->toDateString());

        $series = [];
        for ($i = 0; $i < 14; $i++) {
            $date = $since->copy()->addDays($i)->toDateString();
            $row = $rows->get($date);
            $series[] = [
                'date' => $date,
                'clicks' => $row ? (int) $row->clicks : 0,
                'spend' => $row ? (float) $row->spend : 0,
                'impressions' => $row ? (int) $row->impressions : 0,
                'revenue' => $row ? (float) $row->revenue : 0,
            ];
        }

        return response()->json($series);
    }

    // Platforma göre gerçek reklam performansı (harcama/tıklama) - Meta/Google entegrasyonu canlıya geçince dolar
    public function platform(Request $request)
    {
        $userId = $request->user()->id;

        $rows = CampaignMetric::whereHas('campaign', fn ($q) => $q->where('user_id', $userId))
            ->selectRaw('platform, SUM(clicks) as clicks, SUM(spend) as spend')
            ->groupBy('platform')
            ->orderByDesc('spend')
            ->get()
            ->map(fn ($row) => [
                'platform' => $row->platform,
                'clicks' => (int) $row->clicks,
                'spend' => (float) $row->spend,
            ]);

        return response()->json($rows);
    }

    // Bugün gerçekten sahip olduğumuz veri: kaç kampanya var, hangi durumda, hangi platformlara dağılmış
    private function pipelineStats(int $userId): array
    {
        $platformCounts = [];
        foreach (Campaign::where('user_id', $userId)->pluck('platforms') as $platforms) {
            foreach ((array) $platforms as $platform) {
                $platformCounts[$platform] = ($platformCounts[$platform] ?? 0) + 1;
            }
        }
        arsort($platformCounts);

        return [
            'total_campaigns' => Campaign::where('user_id', $userId)->count(),
            'pending' => Campaign::where('user_id', $userId)->where('approval_status', 'pending')->count(),
            'approved' => Campaign::where('user_id', $userId)->where('approval_status', 'approved')->count(),
            'rejected' => Campaign::where('user_id', $userId)->where('approval_status', 'rejected')->count(),
            'total_daily_budget' => (float) Campaign::where('user_id', $userId)->sum('daily_budget'),
            'platform_distribution' => collect($platformCounts)
                ->map(fn ($count, $platform) => ['platform' => $platform, 'count' => $count])
                ->values(),
        ];
    }
}
