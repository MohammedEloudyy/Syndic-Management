<?php

namespace App\Services;

use App\Models\Resident;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResidentService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function paginate(array $validated): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($validated['per_page'] ?? 15)));

        $query = Resident::query()
            ->where('user_id', auth()->id())
            ->with([
                'appartement' => static fn ($q) => $q->with(['immeuble' => static fn ($i) => $i->select(['id', 'name', 'city'])]),
            ])
            ->withSum('paiementsPayes', 'montant');

        if (! empty($validated['immeuble_id'])) {
            $query->whereHas('appartement', static function ($q) use ($validated): void {
                $q->where('immeuble_id', $validated['immeuble_id']);
            });
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($q) use ($term): void {
                $q->where('full_name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term);
            });
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        return $query->orderBy('full_name')->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Resident
    {
        return DB::transaction(function () use ($validated) {
            return Resident::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'appartement_id' => $validated['appartement_id'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'entry_date' => $validated['entry_date'],
                'monthly_charge' => $validated['monthly_charge'] ?? 0,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Resident $resident, array $validated): Resident
    {
        return DB::transaction(function () use ($resident, $validated) {
            $resident->update([
                'appartement_id' => $validated['appartement_id'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'entry_date' => $validated['entry_date'],
                'monthly_charge' => array_key_exists('monthly_charge', $validated)
                    ? $validated['monthly_charge']
                    : $resident->monthly_charge,
            ]);

            return $resident->fresh([
                'appartement.immeuble',
            ]);
        });
    }

    public function delete(Resident $resident): void
    {
        DB::transaction(static function () use ($resident): void {
            $resident->delete();
        });
    }
}
