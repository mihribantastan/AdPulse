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
        Schema::create('platform_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('platform'); // 'google_ads' | 'meta'
            $table->text('access_token'); // encrypted cast - Meta uzun ömürlü kullanıcı token'ı
            $table->text('refresh_token')->nullable(); // encrypted cast - sadece Google'da var
            $table->string('external_account_id')->nullable(); // Google: customer_id, Meta: act_...
            $table->string('external_account_name')->nullable(); // Ayarlar sayfasında gösterim için
            $table->json('extra')->nullable(); // Google: login_customer_id, Meta: page_id
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_connections');
    }
};
