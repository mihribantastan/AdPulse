<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Campaign\Controllers\AgentCommunicationController;

// Define the API route for agent communication
Route::post('/agent/analyze', [AgentCommunicationController::class, 'analyzeData']);

use App\Http\Controllers\CampaignController;

Route::post('/campaigns', [CampaignController::class, 'store']);

// Python'un sonuçları getireceği dönüş köprüsü
Route::post('/campaigns/complete', [CampaignController::class, 'complete']);
