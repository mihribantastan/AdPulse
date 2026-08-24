<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    // Kullanıcının kendi Google Ads hesabını bağlaması için - girişte kullanılan
    // 'google' ("AdPulse Web Login") client'ının AYNISI kullanılıyor, sadece farklı
    // scope + ayrı bir redirect URI ile. ai_layer/generate_refresh_token.py'nin
    // kullandığı ayrı "AdPulse" client'ı Google Cloud Console'da "Desktop app" tipinde
    // kayıtlı - Desktop tipi client'larda özel "Authorized redirect URIs" eklenemiyor,
    // bu yüzden sunucu taraflı (web) bir OAuth akışı için kullanılamaz; Web application
    // tipindeki 'google' client'ı bunun için uygun. Bu client'ın Google Cloud
    // Console'daki "Authorized redirect URIs" listesine
    // {APP_URL}/api/integrations/google_ads/callback eklenmesi gerekiyor.
    'google_ads' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'developer_token' => env('GOOGLE_ADS_DEVELOPER_TOKEN'),
    ],

    'meta' => [
        'client_id' => env('META_APP_ID'),
        'client_secret' => env('META_APP_SECRET'),
    ],

];
