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
        Schema::create('campaign_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            // 'meta' | 'google_ads' vb. - platforms dizisindeki tekil bir kanal
            $table->string('platform');
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->decimal('spend', 10, 2)->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->unsignedInteger('conversions')->default(0);
            $table->timestamps();

            // Google/Meta'dan senkronize ederken aynı gün+kanal için upsert yapabilmek için
            $table->unique(['campaign_id', 'date', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_metrics');
    }
};
