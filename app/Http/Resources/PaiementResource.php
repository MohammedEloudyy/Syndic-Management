<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'resident_id' => $this->resident_id,
            'montant' => (float) $this->montant,
            'date_paiement' => $this->date_paiement?->toDateString(),
            'statut' => $this->statut,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'resident' => ResidentResource::make($this->whenLoaded('resident')),
        ];
    }
}
