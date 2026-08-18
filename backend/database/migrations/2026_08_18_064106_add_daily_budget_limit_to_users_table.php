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
        Schema::table('users', function (Blueprint $table) {
            // null = sınır yok (varsayılan); kullanıcı Ayarlar'dan bir üst sınır belirlerse
            // CampaignController::store() bunu aşan kampanyaları reddeder.
            $table->decimal('daily_budget_limit', 10, 2)->nullable()->after('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('daily_budget_limit');
        });
    }
};
