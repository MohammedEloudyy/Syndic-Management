<?php

namespace App\Http\Requests\Api\Depense;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepenseIndexRequest extends FormRequest
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
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date', 'after_or_equal:date_from'],
            'categorie' => ['sometimes', 'string', 'max:50'],
        ];
    }
}
