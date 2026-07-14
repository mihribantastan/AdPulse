<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentDataResource extends JsonResource{
    public function toArray(Request $request): array
    {
        return [
            'campaign_id' => $this->id,
            'target_product' => $this->target_url_or_product,
            'budget' => $this->daily_budget,
            'status' => $this->approval_status,
        ];
    }}