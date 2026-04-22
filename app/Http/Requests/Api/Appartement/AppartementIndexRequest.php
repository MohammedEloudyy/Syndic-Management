<?php

namespace App\Http\Requests\Api\Appartement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AppartementIndexRequest extends FormRequest
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
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'string', 'max:255'],
            'immeuble_id' => [
                'sometimes',
                'uuid',
                Rule::exists('immeubles', 'id')->where(fn ($q) => $q->where('user_id', auth()->id())),
            ],
            'statut' => ['sometimes', Rule::in(['occupé', 'vacant'])],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
        ];
    }
}
