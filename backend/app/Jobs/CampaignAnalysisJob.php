<?php

namespace App\Jobs;

use App\Domains\Campaign\Models\Campaign;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CampaignAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Campaign $campaign;

    // Controller'dan gelen kampanyayı bu sınıfa alıyoruz
    public function __construct(Campaign $campaign)
    {
        $this->campaign = $campaign;
    }

    // Kuyruk bu işi eline aldığında çalışacak olan ana fonksiyon
    public function handle(): void
    {
        // İleride Python'daki LangGraph ajanlarına tam olarak buradan istek (HTTP Request) atacağız!
        // Şimdilik sadece log'a yazdıralım çalıştığını görelim:
        \Log::info('Kuyruk çalıştı. Kampanya ID: ' . $this->campaign->id . ' yapay zekaya gönderiliyor...');
    }
}
