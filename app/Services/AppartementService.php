<?php

namespace App\Services;

use App\Models\Appartement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AppartementService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function paginate(array $validated): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($validated['per_page'] ?? 15)));

        $query = Appartement::query()
            ->where('user_id', auth()->id())
            ->with(['immeuble' => static fn ($q) => $q->select(['id', 'name', 'city', 'address'])]);

        if (! empty($validated['immeuble_id'])) {
            $query->where('immeuble_id', $validated['immeuble_id']);
        }

        if (! empty($validated['statut'])) {
            $query->where('status', $validated['statut']);
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where('number', 'like', $term);
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        return $query->orderBy('number')->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Appartement
    {
        return DB::transaction(function () use ($validated) {
            return Appartement::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'immeuble_id' => $validated['immeuble_id'],
                'number' => $validated['number'],
                'floor' => $validated['floor'],
                'surface' => $validated['surface'],
                'rooms' => $validated['rooms'],
                'status' => $validated['status'],
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Appartement $appartement, array $validated): Appartement
    {
        return DB::transaction(function () use ($appartement, $validated) {
            $appartement->update([
                'immeuble_id' => $validated['immeuble_id'],
                'number' => $validated['number'],
                'floor' => $validated['floor'],
                'surface' => $validated['surface'],
                'rooms' => $validated['rooms'],
                'status' => $validated['status'],
            ]);

            return $appartement->fresh(['immeuble']);
        });
    }

    public function delete(Appartement $appartement): void
    {
        DB::transaction(static function () use ($appartement): void {
            $appartement->delete();
        });
    }
}
