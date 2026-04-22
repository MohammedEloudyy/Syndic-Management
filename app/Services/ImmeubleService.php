<?php

namespace App\Services;

use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImmeubleService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function paginate(array $validated): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($validated['per_page'] ?? 15)));

        $query = Immeuble::query()
            ->where('user_id', auth()->id());

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($q) use ($term): void {
                $q->where('name', 'like', $term)
                    ->orWhere('city', 'like', $term)
                    ->orWhere('address', 'like', $term);
            });
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        return $query
            ->with(['appartements' => static fn ($q) => $q->select(['id', 'immeuble_id', 'status'])])
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Immeuble
    {
        return DB::transaction(function () use ($validated) {
            return Immeuble::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'apartment_count' => $validated['apartment_count'],
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Immeuble $immeuble, array $validated): Immeuble
    {
        return DB::transaction(function () use ($immeuble, $validated) {
            $immeuble->update([
                'name' => $validated['name'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'apartment_count' => $validated['apartment_count'],
            ]);

            return $immeuble->fresh();
        });
    }

    public function delete(Immeuble $immeuble): void
    {
        DB::transaction(static function () use ($immeuble): void {
            $immeuble->delete();
        });
    }

    /**
     * @return array{occupied: int, vacant: int}
     */
    public function occupancyCounts(Immeuble $immeuble): array
    {
        $occupied = (int) $immeuble->appartements()
            ->where('status', 'occupé')
            ->count();

        $vacant = (int) $immeuble->appartements()
            ->where('status', 'vacant')
            ->count();

        return [
            'occupied' => $occupied,
            'vacant' => $vacant,
        ];
    }

    /**
     * @return array{total_income: float, total_expenses: float}
     */
    public function incomeVsExpenses(Immeuble $immeuble): array
    {
        $uid = auth()->id();

        $totalIncome = (float) Paiement::query()
            ->where('user_id', $uid)
            ->where('statut', 'payé')
            ->whereHas('resident.appartement', static function ($q) use ($immeuble): void {
                $q->where('immeuble_id', $immeuble->id);
            })
            ->sum('montant');

        $totalExpenses = (float) Depense::query()
            ->where('user_id', $uid)
            ->where('immeuble_id', $immeuble->id)
            ->sum('montant');

        return [
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
        ];
    }
}
