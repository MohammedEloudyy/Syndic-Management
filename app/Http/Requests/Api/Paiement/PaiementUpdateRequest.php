<?php

namespace App\Http\Requests\Api\Paiement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaiementUpdateRequest extends FormRequest
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
            'resident_id' => [
                'sometimes',
                'uuid',
                Rule::exists('residents', 'id')->where(fn ($q) => $q->where('user_id', auth()->id())),
            ],
            'montant' => ['sometimes', 'numeric', 'min:0'],
            'date_paiement' => ['sometimes', 'date'],
            'statut' => ['sometimes', Rule::in(['payé', 'en_attente', 'en_retard'])],
            'type' => ['sometimes', 'string', 'max:255'],
        ];
    }
}
