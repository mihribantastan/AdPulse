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
            $table->text('key_features')->nullable()->after('target_audience');
            $table->string('brand_tone')->nullable()->after('key_features');
            $table->text('extra_notes')->nullable()->after('brand_tone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['key_features', 'brand_tone', 'extra_notes']);
        });
    }
};
