<?php

namespace App\Services;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function stats(User $user): array
    {
        $userId = $user->id;

        // Batch entity counts in a single query
        $counts = DB::query()
            ->selectRaw('
                (SELECT COUNT(*) FROM immeubles WHERE user_id = ?) as total_immeubles,
                (SELECT COUNT(*) FROM appartements WHERE user_id = ?) as total_appartements,
                (SELECT COUNT(*) FROM residents WHERE user_id = ?) as total_residents
            ', [$userId, $userId, $userId])
            ->first();

        // Batch financial sums in a single query
        $finances = DB::query()
            ->selectRaw('
                (SELECT COALESCE(SUM(montant), 0) FROM paiements WHERE user_id = ?) as total_paiements,
                (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE user_id = ?) as total_depenses
            ', [$userId, $userId])
            ->first();

        // Payment status counts in one query
        $paymentStatuses = Paiement::query()
            ->where('user_id', $userId)
            ->selectRaw("
                SUM(CASE WHEN statut = 'payé' THEN 1 ELSE 0 END) as paye,
                SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
                SUM(CASE WHEN statut = 'en_retard' THEN 1 ELSE 0 END) as en_retard
            ")
            ->first();

        return [
            'total_immeubles' => (int) $counts->total_immeubles,
            'total_appartements' => (int) $counts->total_appartements,
            'total_residents' => (int) $counts->total_residents,
            'total_paiements' => (float) $finances->total_paiements,
            'total_depenses' => (float) $finances->total_depenses,
            'payment_status_stats' => [
                ['name' => 'Payé', 'value' => (int) ($paymentStatuses->paye ?? 0)],
                ['name' => 'En attente', 'value' => (int) ($paymentStatuses->en_attente ?? 0)],
                ['name' => 'En retard', 'value' => (int) ($paymentStatuses->en_retard ?? 0)],
            ],
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

        $driver = DB::getDriverName();
        $format = $driver === 'sqlite' ? "strftime('%Y-%m', date_paiement)" : "DATE_FORMAT(date_paiement, '%Y-%m')";

        $pByMonth = Paiement::query()
            ->where('user_id', $userId)
            ->whereBetween('date_paiement', [$start, $end])
            ->selectRaw("$format as month, SUM(montant) as total")
            ->groupByRaw($format)
            ->pluck('total', 'month')
            ->map(fn ($v) => (float) $v)
            ->toArray();

        $formatD = $driver === 'sqlite' ? "strftime('%Y-%m', date_depense)" : "DATE_FORMAT(date_depense, '%Y-%m')";

        $dByMonth = Depense::query()
            ->where('user_id', $userId)
            ->whereBetween('date_depense', [$start, $end])
            ->selectRaw("$formatD as month, SUM(montant) as total")
            ->groupByRaw($formatD)
            ->pluck('total', 'month')
            ->map(fn ($v) => (float) $v)
            ->toArray();

        $stats = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i)->format('Y-m');
            $stats[] = [
                'month' => $month,
                'paiements' => round($pByMonth[$month] ?? 0, 2),
                'depenses' => round($dByMonth[$month] ?? 0, 2),
            ];
        }

        return $stats;
    }
}
