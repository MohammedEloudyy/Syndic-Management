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
            'resident_id' => $this->resident_id,
            'montant' => (float) $this->montant,
            'date_paiement' => $this->date_paiement?->toDateString(),
            'statut' => $this->statut,
            'type' => $this->type,
            'resident' => ResidentResource::make($this->whenLoaded('resident')),
        ];
    }
}
