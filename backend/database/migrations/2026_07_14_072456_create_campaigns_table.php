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

            // Campaign name or title
            $table->string('target_url_or_product')->nullable();

            
            $table->text('strategy_brief')->nullable(); 

            // Creative content fields
            $table->json('creative_texts')->nullable(); // Store multiple creative texts as JSON
            $table->json('creative_images')->nullable(); // Store multiple creative image URLs as JSON  

            
            $table->string('target_audience')->nullable(); 
            $table->decimal('daily_budget', 10, 2)->default(0); 

            // Campaign status fields
            $table->string('approval_status')->default('pending'); // e.g., pending, approved, rejected
            $table->string('execution_status')->default('not_started'); // e.g., not_started, in_progress, completed
            
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
