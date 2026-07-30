<?php

namespace App\Domains\Campaign\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;
    // Mass-assignment hatasını çözen koruma alanı
    protected $fillable = [
        'target_url_or_product', // target_product yerine doğru kolon adı
        'budget',
        'platform',
        'status',
        'generated_content',
    ];

    // JSON verilerini otomatik diziye çevirmesi için
    protected $casts = [
        'generated_content' => 'array',
        'budget' => 'decimal:2',
    ];
}