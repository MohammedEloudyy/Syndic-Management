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
            'user_id' => $this->user_id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'apartment_count' => (int) $this->apartment_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'appartements' => AppartementResource::collection($this->whenLoaded('appartements')),
            'depenses' => DepenseResource::collection($this->whenLoaded('depenses')),
        ];
    }
}
