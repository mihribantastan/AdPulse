<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Campaign\Controllers\AgentCommunicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\MetricsController;

// --------------------------------------------------------
// 0. KİMLİK DOĞRULAMA
// --------------------------------------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
});

// --------------------------------------------------------
// 1. YAPAY ZEKA VE GERÇEK KAMPANYA İŞLEMLERİ
// --------------------------------------------------------
Route::post('/agent/analyze', [AgentCommunicationController::class, 'analyzeData']);

// Python'un (ai_layer/queue_worker.py, publisher.py) sonuçları getireceği dönüş köprüleri - kullanıcı token'ı yok, açık kalmalı
Route::post('/campaigns/complete', [CampaignController::class, 'complete']);
Route::post('/campaigns/publish-complete', [CampaignController::class, 'publishComplete']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
    Route::post('/campaigns/{campaign}/approve', [CampaignController::class, 'approve']);
    Route::post('/campaigns/{campaign}/assets', [CampaignController::class, 'uploadAssets']);

    // --------------------------------------------------------
    // 2. METRİKLER: gerçek reklam performansı + kampanya boru hattı istatistikleri
    // --------------------------------------------------------
    Route::get('/metrics/summary', [MetricsController::class, 'summary']);
    Route::get('/metrics/timeseries', [MetricsController::class, 'timeseries']);
    Route::get('/metrics/platform', [MetricsController::class, 'platform']);
});
