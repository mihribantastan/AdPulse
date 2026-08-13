<?php

namespace App\Http\Controllers;

use App\Domains\Campaign\Models\Campaign;
use App\Domains\Campaign\Models\CampaignMetric;
use Carbon\Carbon;

class MetricsController extends Controller
{
    // Genel bakış: gerçek reklam performansı (Meta/Google senkronize etmeye başlayınca dolacak)
    // + bugün elimizde olan gerçek kampanya boru hattı istatistikleri
    public function summary()
    {
        $totals = CampaignMetric::selectRaw('
            COALESCE(SUM(clicks), 0) as clicks,
            COALESCE(SUM(impressions), 0) as impressions,
            COALESCE(SUM(spend), 0) as spend,
            COALESCE(SUM(revenue), 0) as revenue
        ')->first();

        $hasPerformanceData = CampaignMetric::exists();
        $ctr = $totals->impressions > 0 ? round(($totals->clicks / $totals->impressions) * 100, 2) : 0;

        return response()->json([
            'clicks' => (int) $totals->clicks,
            'spend' => (float) $totals->spend,
            'profit' => (float) ($totals->revenue - $totals->spend),
            'ctr' => $ctr,
            'has_performance_data' => $hasPerformanceData,
            'pipeline' => $this->pipelineStats(),
        ]);
    }

    // Son 14 günün tıklama/harcama trendi (eksik günler 0 ile dolduruluyor, grafik sürekli olsun diye)
    public function timeseries()
    {
        $since = Carbon::today()->subDays(13);

        $rows = CampaignMetric::selectRaw('date, SUM(clicks) as clicks, SUM(spend) as spend')
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

    // Platforma göre gerçek reklam performansı (harcama/tıklama) - Meta/Google entegrasyonu canlıya geçince dolar
    public function platform()
    {
        $rows = CampaignMetric::selectRaw('platform, SUM(clicks) as clicks, SUM(spend) as spend')
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
    private function pipelineStats(): array
    {
        $platformCounts = [];
        foreach (Campaign::pluck('platforms') as $platforms) {
            foreach ((array) $platforms as $platform) {
                $platformCounts[$platform] = ($platformCounts[$platform] ?? 0) + 1;
            }
        }
        arsort($platformCounts);

        return [
            'total_campaigns' => Campaign::count(),
            'pending' => Campaign::where('approval_status', 'pending')->count(),
            'approved' => Campaign::where('approval_status', 'approved')->count(),
            'rejected' => Campaign::where('approval_status', 'rejected')->count(),
            'total_daily_budget' => (float) Campaign::sum('daily_budget'),
            'platform_distribution' => collect($platformCounts)
                ->map(fn ($count, $platform) => ['platform' => $platform, 'count' => $count])
                ->values(),
        ];
    }
}
