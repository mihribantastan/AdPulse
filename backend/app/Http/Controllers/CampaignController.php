<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use App\Domains\Campaign\Models\Campaign;
use App\Domains\Campaign\Models\CampaignAsset;

class CampaignController extends Controller
{
    // Arayüzdeki (Dashboard) kampanyaları listeler - sadece giriş yapan kullanıcınınkiler
    public function index(Request $request)
    {
        // En son eklenen en üstte olacak şekilde getiriyoruz
        $campaigns = Campaign::where('user_id', $request->user()->id)
            ->with('assets')
            ->orderBy('created_at', 'desc')
            ->get();

        // Liste görünümü görselleri göstermiyor (sadece detay sayfası gösteriyor);
        // base64 görseller kampanya başına birkaç MB olabildiğinden, listede taşımak
        // sırf gecikme yaratıyor. Metni (strategy_brief, ad_copy) olduğu gibi bırakıyoruz.
        $campaigns->each(function (Campaign $campaign) {
            $results = $campaign->ai_analysis_results;
            if (!empty($results['creatives'])) {
                $results['creatives'] = collect($results['creatives'])
                    ->map(fn ($c) => collect($c)->except('generated_image_url')->all())
                    ->all();
                $campaign->ai_analysis_results = $results;
            }
        });

        return response()->json($campaigns);
    }

    // Tek bir kampanyanın detayını (ajan sonuçları dahil) getirir
    public function show(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);
        return response()->json($campaign->load('assets'));
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
            'campaign_goal' => 'nullable|string|max:100',
            'cta_preference' => 'nullable|string|max:100',
            'platforms' => 'required|array|min:1',
            'daily_budget' => 'required|numeric|min:1',
        ]);

        // 1. Kampanyayı veritabanına "pending" (bekliyor) olarak kaydet
        $campaign = Campaign::create([
            'user_id' => $request->user()->id,
            'target_url_or_product' => $validated['target_url_or_product'],
            'target_audience' => $validated['target_audience'] ?? null,
            'key_features' => $validated['key_features'] ?? null,
            'brand_tone' => $validated['brand_tone'] ?? null,
            'extra_notes' => $validated['extra_notes'] ?? null,
            'campaign_goal' => $validated['campaign_goal'] ?? null,
            'cta_preference' => $validated['cta_preference'] ?? null,
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

    // Kullanıcının kendi görsel/videolarını kampanyaya ekler (AI'nın yanında referans/gerçek materyal olarak)
    public function uploadAssets(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        $validated = $request->validate([
            'files' => 'required|array|min:1|max:10',
            'files.*' => 'file|mimes:jpg,jpeg,png,webp,mp4,mov,webm|max:51200', // 50MB
        ]);

        $created = [];
        foreach ($validated['files'] as $file) {
            $isVideo = str_starts_with($file->getMimeType(), 'video/');
            $path = $file->store('campaign-assets/' . $campaign->id, 'public');

            $created[] = CampaignAsset::create([
                'campaign_id' => $campaign->id,
                'type' => $isVideo ? 'video' : 'image',
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return response()->json([
            'message' => 'Dosyalar yüklendi.',
            'data' => $created,
        ], 201);
    }

    // Kullanıcı, ajanın ürettiği 3 reklamdan birini seçip onaylar; bu seçimi
    // gerçek Google Ads API çağrısıyla test hesabında yayınlamak üzere kuyruğa atar
    public function approve(Request $request, Campaign $campaign)
    {
        $this->authorizeOwner($request, $campaign);

        $creatives = $campaign->ai_analysis_results['creatives'] ?? [];

        $validated = $request->validate([
            'selected_creative_index' => ['required', 'integer', 'min:0', 'max:' . max(count($creatives) - 1, 0)],
        ]);

        $campaign->update([
            'selected_creative_index' => $validated['selected_creative_index'],
            'approval_status' => 'approved',
            'google_ads_status' => 'publishing',
            'google_ads_error' => null,
        ]);

        $this->dispatchToPublishQueue($campaign, $creatives[$validated['selected_creative_index']]);

        return response()->json([
            'message' => 'Reklam seçildi, kampanya onaylandı ve Google Ads\'e gönderiliyor.',
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

    // Python (ai_layer/publisher.py) gerçek Google Ads API çağrısının sonucunu bildirir
    public function publishComplete(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => 'required|integer|exists:campaigns,id',
            'status' => 'required|string|in:published,failed',
            'google_ads_campaign_id' => 'nullable|string',
            'error' => 'nullable|string',
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);
        $campaign->update([
            'google_ads_status' => $validated['status'],
            'google_ads_campaign_id' => $validated['google_ads_campaign_id'] ?? null,
            'google_ads_error' => $validated['error'] ?? null,
        ]);

        return response()->json([
            'message' => 'Kampanya Google Ads yayın sonucuyla güncellendi.',
            'data' => $campaign,
        ]);
    }

    // Kampanya başka bir kullanıcıya aitse 403 döner
    private function authorizeOwner(Request $request, Campaign $campaign): void
    {
        if ($campaign->user_id !== $request->user()->id) {
            abort(403, 'Bu kampanyaya erişim yetkiniz yok.');
        }
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
                'campaign_goal' => $campaign->campaign_goal,
                'cta_preference' => $campaign->cta_preference,
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

    // ai_layer/queue_worker.py'nin dinlediği "adpulse_publish_queue" listesine seçilen
    // reklamı iter; worker bunu gerçek Google Ads API çağrısıyla test hesabında yayınlar
    private function dispatchToPublishQueue(Campaign $campaign, array $selectedCreative): void
    {
        try {
            Redis::rpush('adpulse_publish_queue', json_encode([
                'campaign_id' => $campaign->id,
                'target_url_or_product' => $campaign->target_url_or_product,
                'daily_budget' => (float) $campaign->daily_budget,
                'strategy_brief' => $campaign->ai_analysis_results['strategy_brief'] ?? null,
                'selected_creative' => $selectedCreative,
            ]));
        } catch (\Throwable $e) {
            $campaign->update([
                'google_ads_status' => 'failed',
                'google_ads_error' => 'Yayın kuyruğuna gönderilemedi: ' . $e->getMessage(),
            ]);
            Log::error('Yayın kuyruğuna gönderim başarısız oldu: ' . $e->getMessage(), [
                'campaign_id' => $campaign->id,
            ]);
        }
    }
}