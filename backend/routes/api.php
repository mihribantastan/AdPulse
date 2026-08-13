<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Domains\Campaign\Controllers\AgentCommunicationController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\MetricsController;

// --------------------------------------------------------
// 1. YAPAY ZEKA VE GERÇEK KAMPANYA İŞLEMLERİ
// --------------------------------------------------------
Route::post('/agent/analyze', [AgentCommunicationController::class, 'analyzeData']);
Route::post('/campaigns', [CampaignController::class, 'store']);

// Python'un sonuçları getireceği dönüş köprüsü
Route::post('/campaigns/complete', [CampaignController::class, 'complete']);

// Kullanıcı 3 reklamdan birini seçip onaylar
Route::post('/campaigns/{campaign}/approve', [CampaignController::class, 'approve']);

// Kullanıcının kendi görsel/videolarını yüklemesi
Route::post('/campaigns/{campaign}/assets', [CampaignController::class, 'uploadAssets']);

// EĞER CONTROLLER HAZIRSA BUNU KULLAN:
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);

// --------------------------------------------------------
// 2. METRİKLER: gerçek reklam performansı (Meta/Google senkron edince dolar) + kampanya boru hattı istatistikleri
// --------------------------------------------------------
Route::get('/metrics/summary', [MetricsController::class, 'summary']);
Route::get('/metrics/timeseries', [MetricsController::class, 'timeseries']);
Route::get('/metrics/platform', [MetricsController::class, 'platform']);