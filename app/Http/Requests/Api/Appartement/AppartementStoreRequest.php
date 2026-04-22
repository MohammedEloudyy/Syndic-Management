<?php

namespace App\Http\Requests\Api\Appartement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AppartementStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\In>>
     */
    public function rules(): array
    {
        return [
            'immeuble_id' => [
                'required',
                'uuid',
                Rule::exists('immeubles', 'id')->where(fn ($q) => $q->where('user_id', auth()->id())),
            ],
            'number' => ['required', 'string', 'max:50'],
            'floor' => ['required', 'integer', 'min:0'],
            'surface' => ['required', 'integer', 'min:0'],
            'rooms' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['occupé', 'vacant'])],
        ];
    }
}
