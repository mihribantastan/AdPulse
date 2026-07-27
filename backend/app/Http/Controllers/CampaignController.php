<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use App\Models\Campaign; // Veritabanı temsilcimizi (Model) içeri alıyoruz

class CampaignController extends Controller
{
    // Yeni kampanya oluşturma ve kuyruğa atma
    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_product' => 'required|string',
            'strategy_brief' => 'required|string',
            'daily_budget' => 'required|numeric',
        ]);

        // 1. Kampanyayı veritabanına "pending" (bekliyor) olarak kaydet
        $campaign = Campaign::create([
            'target_product' => $validated['target_product'],
            'strategy_brief' => $validated['strategy_brief'],
            'daily_budget' => $validated['daily_budget'],
            'status' => 'pending',
        ]);

        // 2. Python'a göndereceğimiz paketi hazırla (Artık gerçek veritabanı ID'sini yolluyoruz)
        $queueData = [
            'campaign_id' => $campaign->id, 
            'target_product' => $campaign->target_product,
            'strategy_brief' => $campaign->strategy_brief,
            'daily_budget' => $campaign->daily_budget,
        ];

        // 3. Paketi Redis üzerinden ajanlara fırlat
        Redis::rpush('adpulse_queue', json_encode($queueData));

        return response()->json([
            'message' => 'Kampanya veritabanına kaydedildi ve yapay zeka ajanlarına iletildi! 🚀',
            'campaign_id' => $campaign->id
        ]);
    }

    // Python'dan dönen sonuçları karşılama
    public function complete(Request $request)
    {
        $data = $request->all();

        // 1. Gelen ID ile veritabanından o kampanyayı bul
        $campaign = Campaign::find($data['campaign_id']);

        if ($campaign) {
            // 2. Yapay zekanın ürettiği metni kaydet ve durumu güncelle
            $campaign->generated_content = $data['generated_content'];
            $campaign->status = 'completed';
            $campaign->save();

            \Log::info("AdPulse Başarısı: Kampanya ID {$campaign->id} veritabanına işlendi! 🏆");

            return response()->json(['message' => 'Sonuçlar veritabanına başarıyla kaydedildi!']);
        }

        return response()->json(['message' => 'Kampanya bulunamadı!'], 404);
    }
}