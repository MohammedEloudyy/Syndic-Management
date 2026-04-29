<?php

namespace App\Services;

use App\Models\Depense;
use App\Models\Paiement;
use App\Models\User;
use App\Services\CacheService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * DashboardService
 * 
 * Modular service for dashboard data orchestration.
 * Uses domain-specific caching and optimized SQL aggregation.
 */
class DashboardService
{
    public function __construct(
        protected CacheService $cacheService
    ) {}

    /**
     * Get the aggregated overview for the dashboard.
     */
    public function getOverview(User $user): array
    {
        $userId = $user->id;
        $cacheKey = $this->cacheService->getDashboardKey($userId);

        return Cache::remember($cacheKey, 60, function () use ($user) {
            return [
                'stats' => $this->getGlobalStats($user->id),
                'charts' => $this->getMonthlyTrends($user->id),
                'recent_activities' => $this->getRecentActivities($user->id),
            ];
        });
    }

    /**
     * Compute global entity counts and financial totals.
     */
    private function getGlobalStats(int $userId): array
    {
        // Entity counts using indexed user_id
        $counts = DB::query()
            ->selectRaw('
                (SELECT COUNT(*) FROM immeubles WHERE user_id = ?) as buildings,
                (SELECT COUNT(*) FROM appartements WHERE user_id = ?) as apartments,
                (SELECT COUNT(*) FROM residents WHERE user_id = ?) as residents
            ', [$userId, $userId, $userId])
            ->first();

        // Financial totals
        $finances = DB::query()
            ->selectRaw('
                (SELECT COALESCE(SUM(montant), 0) FROM paiements WHERE user_id = ?) as total_revenue,
                (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE user_id = ?) as total_expenses
            ', [$userId, $userId])
            ->first();

        // Payment status distribution
        $statusCounts = Paiement::where('user_id', $userId)
            ->select('statut', DB::raw('count(*) as count'))
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();

        return [
            'counts' => [
                'buildings' => (int) $counts->buildings,
                'apartments' => (int) $counts->apartments,
                'residents' => (int) $counts->residents,
            ],
            'finances' => [
                'revenue' => (float) $finances->total_revenue,
                'expenses' => (float) $finances->total_expenses,
                'balance' => (float) ($finances->total_revenue - $finances->total_expenses),
            ],
            'payment_distribution' => [
                ['name' => 'Payé', 'value' => (int) ($statusCounts['payé'] ?? 0)],
                ['name' => 'En attente', 'value' => (int) ($statusCounts['en_attente'] ?? 0)],
                ['name' => 'En retard', 'value' => (int) ($statusCounts['en_retard'] ?? 0)],
            ]
        ];
    }

    /**
     * Compute revenue vs expenses trends for the last 6 months.
     */
    private function getMonthlyTrends(int $userId): array
    {
        $start = now()->startOfMonth()->subMonths(5)->toDateString();
        $end = now()->endOfMonth()->toDateString();

        $driver = DB::getDriverName();
        $payFormat = $driver === 'sqlite' ? "strftime('%Y-%m', date_paiement)" : "DATE_FORMAT(date_paiement, '%Y-%m')";
        $depFormat = $driver === 'sqlite' ? "strftime('%Y-%m', date_depense)" : "DATE_FORMAT(date_depense, '%Y-%m')";

        $revenues = Paiement::where('user_id', $userId)
            ->whereBetween('date_paiement', [$start, $end])
            ->selectRaw("$payFormat as month, SUM(montant) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $expenses = Depense::where('user_id', $userId)
            ->whereBetween('date_depense', [$start, $end])
            ->selectRaw("$depFormat as month, SUM(montant) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->startOfMonth()->subMonths($i)->format('Y-m');
            $data[] = [
                'month' => $month,
                'paiements' => (float) ($revenues[$month] ?? 0),
                'depenses' => (float) ($expenses[$month] ?? 0),
            ];
        }

        return $data;
    }

    /**
     * Get the latest activities (Recent payments).
     */
    private function getRecentActivities(int $userId): array
    {
        return Paiement::where('user_id', $userId)
            ->with(['resident.appartement:id,number'])
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'type' => 'paiement',
                'title' => "Paiement de " . ($p->resident->full_name ?? 'Resident'),
                'subtitle' => "Appt " . ($p->resident->appartement->number ?? '-') . " • " . $p->montant . " MAD",
                'status' => $p->statut,
                'date' => $p->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
