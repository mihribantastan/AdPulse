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
            // Kullanıcı artık reklam metnini ve görselini ayrı ayrı seçebiliyor
            // (farklı kreatiflerden bile olsa) - tek bir "seçilen kreatif" indeksi yerine.
            $table->dropColumn('selected_creative_index');
            $table->unsignedTinyInteger('selected_copy_index')->nullable()->after('ai_analysis_results');
            $table->unsignedTinyInteger('selected_image_index')->nullable()->after('selected_copy_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['selected_copy_index', 'selected_image_index']);
            $table->unsignedTinyInteger('selected_creative_index')->nullable()->after('ai_analysis_results');
        });
    }
};
