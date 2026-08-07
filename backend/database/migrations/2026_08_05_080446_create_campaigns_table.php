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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('target_url_or_product');
            $table->text('target_audience')->nullable();
            $table->json('platforms'); // Hangi platformlarda yayınlanacağı (Dizi olarak tutacağız)
            $table->decimal('daily_budget', 10, 2);
            $table->string('approval_status')->default('pending'); // pending, approved, completed vs.
            
            // Yapay zeka ajanlarının sonradan dolduracağı alanlar
            $table->json('ai_analysis_results')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};