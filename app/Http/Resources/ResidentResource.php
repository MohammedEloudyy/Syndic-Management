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
            'appartement_id' => $this->appartement_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'entry_date' => $this->entry_date,
            'monthly_charge' => $monthly,
            'total_paid' => $paid,
            'remaining_balance' => $remaining,
            'appartement' => AppartementResource::make($this->whenLoaded('appartement')),
        ];
    }
}
