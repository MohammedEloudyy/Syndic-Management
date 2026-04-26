<?php

namespace App\Services;

use App\Models\Paiement;
use App\Models\Resident;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaiementService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function paginate(array $validated): LengthAwarePaginator
    {
        $perPage = min(100, max(1, (int) ($validated['per_page'] ?? 10)));

        $query = Paiement::query()
            ->where('user_id', auth()->id())
            ->with([
                'resident' => static fn ($q) => $q->select(['id', 'full_name', 'email', 'appartement_id'])
                    ->with([
                        'appartement' => static fn ($a) => $a->select(['id', 'number', 'immeuble_id'])
                            ->with(['immeuble' => static fn ($i) => $i->select(['id', 'name', 'city'])]),
                    ]),
            ]);

        if (! empty($validated['immeuble_id'])) {
            $query->whereHas('resident.appartement', static function ($q) use ($validated): void {
                $q->where('immeuble_id', $validated['immeuble_id']);
            });
        }

        if (! empty($validated['statut'])) {
            $query->where('statut', $validated['statut']);
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($q) use ($term): void {
                $q->whereHas('resident', static function ($r) use ($term): void {
                    $r->where('full_name', 'like', $term)
                        ->orWhere('email', 'like', $term);
                })->orWhere('montant', 'like', $term);
            });
        }

        if (! empty($validated['resident_id'])) {
            $query->where('resident_id', $validated['resident_id']);
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('date_paiement', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('date_paiement', '<=', $validated['date_to']);
        }

        return $query->orderByDesc('date_paiement')->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Paiement
    {
        return DB::transaction(function () use ($validated) {
            return Paiement::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => auth()->id(),
                'resident_id' => $validated['resident_id'],
                'montant' => $validated['montant'],
                'date_paiement' => $validated['date_paiement'],
                'statut' => $validated['statut'],
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Paiement $paiement, array $validated): Paiement
    {
        return DB::transaction(function () use ($paiement, $validated) {
            $data = [];
            if (array_key_exists('resident_id', $validated)) {
                $data['resident_id'] = $validated['resident_id'];
            }
            if (array_key_exists('montant', $validated)) {
                $data['montant'] = $validated['montant'];
            }
            if (array_key_exists('date_paiement', $validated)) {
                $data['date_paiement'] = $validated['date_paiement'];
            }
            if (array_key_exists('statut', $validated)) {
                $data['statut'] = $validated['statut'];
            }

            if ($data !== []) {
                $paiement->update($data);
            }

            return $paiement->fresh(['resident.appartement.immeuble']);
        });
    }

    public function delete(Paiement $paiement): void
    {
        DB::transaction(static function () use ($paiement): void {
            $paiement->delete();
        });
    }

    public function totalPaidForResident(Resident $resident): float
    {
        return (float) $resident->paiementsPayes()->sum('montant');
    }

    public function remainingBalance(Resident $resident): float
    {
        $monthly = (float) $resident->monthly_charge;
        $paid = $this->totalPaidForResident($resident);

        return max(0, $monthly - $paid);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, float>
     */
    public function stats(array $filters): array
    {
        $query = Paiement::query()->where('user_id', auth()->id());

        if (! empty($filters['immeuble_id'])) {
            $query->whereHas('resident.appartement', static function ($q) use ($filters): void {
                $q->where('immeuble_id', $filters['immeuble_id']);
            });
        }

        if (! empty($filters['resident_id'])) {
            $query->where('resident_id', $filters['resident_id']);
        }

        return [
            'total' => (float) (clone $query)->sum('montant'),
            'paid' => (float) (clone $query)->where('statut', 'payé')->sum('montant'),
            'pending' => (float) (clone $query)->where('statut', 'en_attente')->sum('montant'),
            'overdue' => (float) (clone $query)->where('statut', 'en_retard')->sum('montant'),
        ];
    }
}
