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
            'daily_budget' => 'required|numeric|min:0',
        ]);

        // Create a new campaign record in the database
        // Note: In a real application, you might want to handle exceptions and errors during creation.
        // For demonstration purposes, we will create a dummy data object to return
        $campaign = Campaign::create($validated);

        // Refresh the campaign instance to ensure we have the latest data
        $campaign->refresh();

        // Return the created campaign wrapped in the AgentDataResource
        return new AgentDataResource($campaign);
    }
}