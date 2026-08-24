<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // google_ads_* üçlüsünün Meta (Facebook/Instagram) karşılığı - kampanya
            // birden fazla platforma birden yayınlanabildiği için her platformun
            // kendi durum/hata/harici-id alanı var.
            $table->string('meta_status')->nullable()->after('google_ads_error');
            $table->string('meta_campaign_id')->nullable()->after('meta_status');
            $table->text('meta_error')->nullable()->after('meta_campaign_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['meta_status', 'meta_campaign_id', 'meta_error']);
        });
    }
};
