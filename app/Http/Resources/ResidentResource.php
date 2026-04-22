<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResidentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $monthly = (float) $this->monthly_charge;
        $paid = (float) ($this->paiements_payes_sum_montant ?? 0);
        $remaining = max(0, $monthly - $paid);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'appartement_id' => $this->appartement_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'entry_date' => $this->entry_date,
            'monthly_charge' => $monthly,
            'total_paid' => $paid,
            'remaining_balance' => $remaining,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'appartement' => AppartementResource::make($this->whenLoaded('appartement')),
        ];
    }
}
