<?php

namespace App\Domains\Campaign\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;
    // Mass-assignment hatasını çözen koruma alanı (campaigns tablosundaki gerçek kolonlarla eşleşir)
    protected $fillable = [
        'user_id',
        'target_url_or_product',
        'target_audience',
        'key_features',
        'brand_tone',
        'extra_notes',
        'campaign_goal',
        'cta_preference',
        'platforms',
        'daily_budget',
        'approval_status',
        'ai_analysis_results',
        'selected_creative_index',
        'google_ads_status',
        'google_ads_campaign_id',
        'google_ads_error',
    ];

    // JSON verilerini otomatik diziye çevirmesi için
    protected $casts = [
        'platforms' => 'array',
        'ai_analysis_results' => 'array',
        'daily_budget' => 'decimal:2',
        'selected_creative_index' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assets()
    {
        return $this->hasMany(CampaignAsset::class);
    }

    public function metrics()
    {
        return $this->hasMany(CampaignMetric::class);
    }
}