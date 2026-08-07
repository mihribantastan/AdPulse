<?php

namespace App\Domains\Campaign\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Resources\AgentDataResource;
use App\Domains\Campaign\Models\Campaign;

class AgentCommunicationController extends Controller
{
    public function analyzeData(Request $request)
    {
        // Check for the custom API key in the request headers
        if ($request->header('X-API-KEY') !== 'adpulse-gizli-python-anahtari') {
            return response()->json(['error' => 'Yetkisiz erişim! Kapı duvar.'], 401);
        }

        // Validate the incoming request data
        $validated = $request->validate([
            'target_url_or_product' => 'required|string|max:255',
            'strategy_brief' => 'nullable|string',
            'creative_texts' => 'nullable|array',
            'creative_images' => 'nullable|array',
            'target_audience' => 'nullable|string|max:255',
            'platforms' => 'nullable|array',
            'daily_budget' => 'required|numeric|min:0',
        ]);

        // Create a new campaign record in the database
        $campaign = Campaign::create([
            'target_url_or_product' => $validated['target_url_or_product'],
            'target_audience' => $validated['target_audience'] ?? null,
            'platforms' => $validated['platforms'] ?? [],
            'daily_budget' => $validated['daily_budget'],
            'approval_status' => 'pending',
            'ai_analysis_results' => [
                'strategy_brief' => $validated['strategy_brief'] ?? null,
                'creative_texts' => $validated['creative_texts'] ?? null,
                'creative_images' => $validated['creative_images'] ?? null,
            ],
        ]);

        // Refresh the campaign instance to ensure we have the latest data
        $campaign->refresh();

        // Return the created campaign wrapped in the AgentDataResource
        return new AgentDataResource($campaign);
    }
}