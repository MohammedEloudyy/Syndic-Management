<?php

namespace App\Http\Requests\Api\Resident;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResidentUpdateRequest extends FormRequest
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
            'appartement_id' => [
                'required',
                'uuid',
                Rule::exists('appartements', 'id')->where(fn ($q) => $q->where('user_id', auth()->id())),
            ],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'entry_date' => ['required', 'date'],
            'monthly_charge' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
