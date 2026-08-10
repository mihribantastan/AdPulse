<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use App\Domains\Campaign\Models\Campaign;

class CampaignController extends Controller
{
    // Arayüzdeki (Dashboard) kampanyaları listeler
    public function index()
    {
        // En son eklenen en üstte olacak şekilde getiriyoruz
        $campaigns = Campaign::orderBy('created_at', 'desc')->get();
        return response()->json($campaigns);
    }

    // Tek bir kampanyanın detayını (ajan sonuçları dahil) getirir
    public function show(Campaign $campaign)
    {
        return response()->json($campaign);
    }

    // Arayüzden gelen yeni kampanya talebini alır ve kaydeder
    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_url_or_product' => 'required|string|max:255',
            'target_audience' => 'nullable|string|max:255',
            'key_features' => 'nullable|string|max:2000',
            'brand_tone' => 'nullable|string|max:100',
            'extra_notes' => 'nullable|string|max:2000',
            'platforms' => 'required|array|min:1',
            'daily_budget' => 'required|numeric|min:1',
        ]);

        // 1. Kampanyayı veritabanına "pending" (bekliyor) olarak kaydet
        $campaign = Campaign::create([
            'target_url_or_product' => $validated['target_url_or_product'],
            'target_audience' => $validated['target_audience'] ?? null,
            'key_features' => $validated['key_features'] ?? null,
            'brand_tone' => $validated['brand_tone'] ?? null,
            'extra_notes' => $validated['extra_notes'] ?? null,
            'platforms' => $validated['platforms'],
            'daily_budget' => $validated['daily_budget'],
            'approval_status' => 'pending',
            'ai_analysis_results' => null,
        ]);

        // 2. Ajanları tetikle: kampanyayı Redis kuyruğuna at (ai_layer/queue_worker.py dinliyor)
        $this->dispatchToAgentQueue($campaign);

        return response()->json([
            'message' => 'Kampanya oluşturuldu ve ajanlara iletildi.',
            'data' => $campaign
        ], 201);
    }

    // Kullanıcı, ajanın ürettiği 3 reklamdan birini seçip onaylar
    public function approve(Request $request, Campaign $campaign)
    {
        $creatives = $campaign->ai_analysis_results['creatives'] ?? [];

        $validated = $request->validate([
            'selected_creative_index' => ['required', 'integer', 'min:0', 'max:' . max(count($creatives) - 1, 0)],
        ]);

        $campaign->update([
            'selected_creative_index' => $validated['selected_creative_index'],
            'approval_status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Reklam seçildi ve kampanya onaylandı.',
            'data' => $campaign,
        ]);
    }

    // Python (ai_layer/queue_worker.py) ajanların ürettiği sonuçla kampanyayı günceller
    public function complete(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => 'required|integer|exists:campaigns,id',
            'generated_content' => 'nullable',
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);
        $campaign->update([
            'ai_analysis_results' => $validated['generated_content'] ?? null,
        ]);

        return response()->json([
            'message' => 'Kampanya AI sonuçlarıyla güncellendi.',
            'data' => $campaign,
        ]);
    }

    // ai_layer/queue_worker.py'nin BLPOP ile dinlediği "adpulse_queue" listesine kampanyayı iter
    private function dispatchToAgentQueue(Campaign $campaign): void
    {
        try {
            Redis::rpush('adpulse_queue', json_encode([
                'campaign_id' => $campaign->id,
                'target_product' => $campaign->target_url_or_product,
                'target_audience' => $campaign->target_audience,
                'key_features' => $campaign->key_features,
                'brand_tone' => $campaign->brand_tone,
                'extra_notes' => $campaign->extra_notes,
                'platforms' => $campaign->platforms,
                'daily_budget' => (float) $campaign->daily_budget,
            ]));
        } catch (\Throwable $e) {
            // Kuyruk şu an ayakta değilse kampanya kaydı yine de oluşmuş olsun;
            // ajan tetikleme başarısızlığı kullanıcıya 500 olarak yansımasın.
            Log::error('Ajan kuyruğuna gönderim başarısız oldu: ' . $e->getMessage(), [
                'campaign_id' => $campaign->id,
            ]);
        }
    }
}