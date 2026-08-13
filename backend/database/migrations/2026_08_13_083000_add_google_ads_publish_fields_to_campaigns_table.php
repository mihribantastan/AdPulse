<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->string('google_ads_status')->nullable()->after('selected_creative_index');
            $table->string('google_ads_campaign_id')->nullable()->after('google_ads_status');
            $table->text('google_ads_error')->nullable()->after('google_ads_campaign_id');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['google_ads_status', 'google_ads_campaign_id', 'google_ads_error']);
        });
    }
};
