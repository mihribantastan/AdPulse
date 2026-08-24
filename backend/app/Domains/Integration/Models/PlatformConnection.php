<?php

namespace App\Domains\Integration\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class PlatformConnection extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'access_token',
        'refresh_token',
        'external_account_id',
        'external_account_name',
        'extra',
        'expires_at',
    ];

    protected $casts = [
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
        'extra' => 'array',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
