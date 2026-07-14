<?php

namespace App\Domains\Campaign\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'target_url_or_product',
        'strategy_brief',
        'creative_texts',
        'creative_images',
        'target_audience',
        'daily_budget',
        'approval_status',
    ];

    // Define the casts for JSON fields and other attributes
    protected $casts = [
        'creative_texts' => 'array',
        'creative_images' => 'array',
        'daily_budget' => 'decimal:2',
    ];
}