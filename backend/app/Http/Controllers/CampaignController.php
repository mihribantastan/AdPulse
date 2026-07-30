<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

    // Arayüzden gelen yeni kampanya talebini alır ve kaydeder
    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_url_or_product' => 'required|string|max:255',
            'budget' => 'required|numeric|min:100',
            'platform' => 'required|string',
        ]);

        // 1. Kampanyayı veritabanına "pending" (bekliyor) olarak kaydet
        $campaign = Campaign::create([
            'target_url_or_product' => $validated['target_url_or_product'],
            'budget' => $validated['budget'],
            'platform' => $validated['platform'],
            'status' => 'pending',
            'generated_content' => null, 
        ]);

        // TODO: Yapay zeka ajanlarını (Python/AI Layer) tetikleyecek kod buraya gelecek

        return response()->json([
            'message' => 'Kampanya oluşturuldu ve ajanlara iletildi.',
            'data' => $campaign
        ], 201);
    }
}