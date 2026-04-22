<?php

namespace App\Http\Requests\Api\Depense;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DepenseStoreRequest extends FormRequest
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
            'titre' => ['required', 'string', 'max:255'],
            'montant' => ['required', 'numeric', 'min:0'],
            'date_depense' => ['required', 'date'],
        ];
    }
}
