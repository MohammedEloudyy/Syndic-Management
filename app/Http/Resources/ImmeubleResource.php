<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImmeubleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'apartment_count' => (int) $this->apartment_count,
            'appartements' => AppartementResource::collection($this->whenLoaded('appartements')),
            'depenses' => DepenseResource::collection($this->whenLoaded('depenses')),
        ];
    }
}
