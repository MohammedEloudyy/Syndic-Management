<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepenseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'immeuble_id' => $this->immeuble_id,
            'titre' => $this->titre,
            'montant' => (float) $this->montant,
            'date_depense' => $this->date_depense?->toDateString(),
            'categorie' => $this->categorie,
            'immeuble' => ImmeubleResource::make($this->whenLoaded('immeuble')),
        ];
    }
}
