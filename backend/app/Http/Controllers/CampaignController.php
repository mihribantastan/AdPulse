<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class CampaignController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_product' => 'required|string|max:255',
            'strategy_brief' => 'required|string',
            'daily_budget' => 'required|numeric',
        ]);

        $campaignId = rand(1000, 9999);

        $data = [
            'campaign_id' => $campaignId,
            'target_product' => $validated['target_product'],
            'strategy_brief' => $validated['strategy_brief'],
            'daily_budget' => (float) $validated['daily_budget']
        ];

        Redis::rpush('adpulse_queue', json_encode($data));

        return response()->json([
            'status' => 'success',
            'message' => 'Kampanya yapay zeka ajanlarına başarıyla iletildi! 🚀',
            'campaign_id' => $campaignId
        ], 200);
    }
}