<?php

namespace App\Domains\Campaign\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;
    // Mass-assignment hatasını çözen koruma alanı (campaigns tablosundaki gerçek kolonlarla eşleşir)
    protected $fillable = [
        'target_url_or_product',
        'target_audience',
        'platforms',
        'daily_budget',
        'approval_status',
        'ai_analysis_results',
        'selected_creative_index',
    ];

    // JSON verilerini otomatik diziye çevirmesi için
    protected $casts = [
        'platforms' => 'array',
        'ai_analysis_results' => 'array',
        'daily_budget' => 'decimal:2',
        'selected_creative_index' => 'integer',
    ];
}