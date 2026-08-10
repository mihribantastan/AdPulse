<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Domains\Campaign\Controllers\AgentCommunicationController;
use App\Http\Controllers\CampaignController;

// --------------------------------------------------------
// 1. YAPAY ZEKA VE GERÇEK KAMPANYA İŞLEMLERİ
// --------------------------------------------------------
Route::post('/agent/analyze', [AgentCommunicationController::class, 'analyzeData']);
Route::post('/campaigns', [CampaignController::class, 'store']);

// Python'un sonuçları getireceği dönüş köprüsü
Route::post('/campaigns/complete', [CampaignController::class, 'complete']);

// EĞER CONTROLLER HAZIRSA BUNU KULLAN:
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);

// --------------------------------------------------------
// 2. REACT FRONTEND'İ TEST ETMEK İÇİN SAHTE (MOCK) VERİLER
// --------------------------------------------------------
Route::get('/metrics/summary', function () {
    return response()->json([
        'clicks' => 24500,
        'spend' => 12450.50,
        'profit' => 8400.75,
        'ctr' => 4.2
    ]);
});

// NOT: Eğer üstteki CampaignController::index henüz hazır değilse
// ve sayfa hata veriyorsa, üstteki satırı yoruma alıp (//) aşağıdaki bloğu açabilirsin:
/*
Route::get('/campaigns', function () {
    return response()->json([]);
});
*/