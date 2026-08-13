<?php

namespace App\Domains\Campaign\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignMetric extends Model
{
    protected $fillable = [
        'campaign_id',
        'date',
        'platform',
        'impressions',
        'clicks',
        'spend',
        'revenue',
        'conversions',
    ];

    protected $casts = [
        'date' => 'date',
        'spend' => 'decimal:2',
        'revenue' => 'decimal:2',
    ];

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}
