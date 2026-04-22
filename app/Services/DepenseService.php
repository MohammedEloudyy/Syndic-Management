<?php

namespace App\Services;

use App\Models\Depense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DepenseService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function paginate(array $validated): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($validated['per_page'] ?? 15)));

        $query = Depense::query()
            ->where('user_id', auth()->id())
            ->with(['immeuble' => static fn ($q) => $q->select(['id', 'name', 'city'])]);

        if (! empty($validated['immeuble_id'])) {
            $query->where('immeuble_id', $validated['immeuble_id']);
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where('titre', 'like', $term);
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('date_depense', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('date_depense', '<=', $validated['date_to']);
        }

        return $query->orderByDesc('date_depense')->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Depense
    {
        return DB::transaction(function () use ($validated) {
            return Depense::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'immeuble_id' => $validated['immeuble_id'],
                'titre' => $validated['titre'],
                'montant' => $validated['montant'],
                'date_depense' => $validated['date_depense'],
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Depense $depense, array $validated): Depense
    {
        return DB::transaction(function () use ($depense, $validated) {
            $data = [];
            if (array_key_exists('immeuble_id', $validated)) {
                $data['immeuble_id'] = $validated['immeuble_id'];
            }
            if (array_key_exists('titre', $validated)) {
                $data['titre'] = $validated['titre'];
            }
            if (array_key_exists('montant', $validated)) {
                $data['montant'] = $validated['montant'];
            }
            if (array_key_exists('date_depense', $validated)) {
                $data['date_depense'] = $validated['date_depense'];
            }

            if ($data !== []) {
                $depense->update($data);
            }

            return $depense->fresh(['immeuble']);
        });
    }

    public function delete(Depense $depense): void
    {
        DB::transaction(static function () use ($depense): void {
            $depense->delete();
        });
    }
}

