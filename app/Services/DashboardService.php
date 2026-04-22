<?php

namespace App\Services;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function stats(User $user): array
    {
        $userId = $user->id;

        return [
            'total_immeubles' => Immeuble::query()->where('user_id', $userId)->count(),
            'total_appartements' => Appartement::query()->where('user_id', $userId)->count(),
            'total_residents' => Resident::query()->where('user_id', $userId)->count(),
            'total_paiements' => Paiement::query()->where('user_id', $userId)->count(),
            'total_depenses' => Depense::query()->where('user_id', $userId)->count(),
            'monthly_stats' => $this->monthlyStats($userId),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function monthlyStats(int $userId): array
    {
        $start = now()->startOfMonth()->subMonths(5)->toDateString();
        $end = now()->endOfMonth()->toDateString();

        $paiements = Paiement::query()
            ->where('user_id', $userId)
            ->whereBetween('date_paiement', [$start, $end])
            ->get(['date_paiement', 'montant']);

        $depenses = Depense::query()
            ->where('user_id', $userId)
            ->whereBetween('date_depense', [$start, $end])
            ->get(['date_depense', 'montant']);

        $pByMonth = [];
        foreach ($paiements as $paiement) {
            $month = Carbon::parse($paiement->date_paiement)->format('Y-m');
            $pByMonth[$month] = ($pByMonth[$month] ?? 0) + (float) $paiement->montant;
        }

        $dByMonth = [];
        foreach ($depenses as $depense) {
            $month = Carbon::parse($depense->date_depense)->format('Y-m');
            $dByMonth[$month] = ($dByMonth[$month] ?? 0) + (float) $depense->montant;
        }

        $stats = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i)->format('Y-m');
            $stats[] = [
                'month' => $month,
                'paiements' => round((float) ($pByMonth[$month] ?? 0), 2),
                'depenses' => round((float) ($dByMonth[$month] ?? 0), 2),
            ];
        }

        return $stats;
    }
}
