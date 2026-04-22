<?php

namespace App\Http\Requests\Api\Immeuble;

use Illuminate\Foundation\Http\FormRequest;

class ImmeubleUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'apartment_count' => ['required', 'integer', 'min:0'],
        ];
    }
}
