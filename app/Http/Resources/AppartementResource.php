<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppartementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'immeuble_id' => $this->immeuble_id,
            'number' => $this->number,
            'floor' => (int) $this->floor,
            'surface' => (int) $this->surface,
            'rooms' => (int) $this->rooms,
            'status' => $this->status,
            'immeuble' => ImmeubleResource::make($this->whenLoaded('immeuble')),
        ];
    }
}
