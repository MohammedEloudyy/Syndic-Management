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
     * Get the annual dashboard overview for a specific year.
     */
    public function getAnnualOverview(User $user, int $year): array
    {
        $userId = $user->id;
        $cacheKey = "dashboard:annual:{$userId}:{$year}";

        return Cache::remember($cacheKey, 120, function () use ($userId, $year) {
            return [
                'year' => $year,
                'stats' => $this->getAnnualStats($userId, $year),
                'monthly_breakdown' => $this->getAnnualMonthlyBreakdown($userId, $year),
                'expense_categories' => $this->getAnnualExpenseCategories($userId, $year),
                'comparison' => $this->getYearComparison($userId, $year),
            ];
        });
    }

    /**
     * Compute annual financial stats.
     */
    private function getAnnualStats(int $userId, int $year): array
    {
        $startDate = "{$year}-01-01";
        $endDate = "{$year}-12-31";

        $finances = DB::query()
            ->selectRaw('
                (SELECT COALESCE(SUM(montant), 0) FROM paiements WHERE user_id = ? AND date_paiement BETWEEN ? AND ?) as total_revenue,
                (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE user_id = ? AND date_depense BETWEEN ? AND ?) as total_expenses
            ', [$userId, $startDate, $endDate, $userId, $startDate, $endDate])
            ->first();

        $statusCounts = Paiement::where('user_id', $userId)
            ->whereBetween('date_paiement', [$startDate, $endDate])
            ->select('statut', DB::raw('count(*) as count'))
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();

        $totalPayments = array_sum($statusCounts);

        return [
            'revenue' => (float) $finances->total_revenue,
            'expenses' => (float) $finances->total_expenses,
            'balance' => (float) ($finances->total_revenue - $finances->total_expenses),
            'total_payments' => $totalPayments,
            'payment_status' => [
                ['name' => 'Payé', 'value' => (int) ($statusCounts['payé'] ?? 0)],
                ['name' => 'En attente', 'value' => (int) ($statusCounts['en_attente'] ?? 0)],
                ['name' => 'En retard', 'value' => (int) ($statusCounts['en_retard'] ?? 0)],
            ],
        ];
    }

    /**
     * Get monthly revenue vs expenses breakdown for the year.
     */
    private function getAnnualMonthlyBreakdown(int $userId, int $year): array
    {
        $startDate = "{$year}-01-01";
        $endDate = "{$year}-12-31";

        $driver = DB::getDriverName();
        $payFormat = $driver === 'sqlite' ? "strftime('%m', date_paiement)" : "MONTH(date_paiement)";
        $depFormat = $driver === 'sqlite' ? "strftime('%m', date_depense)" : "MONTH(date_depense)";

        $revenues = Paiement::where('user_id', $userId)
            ->whereBetween('date_paiement', [$startDate, $endDate])
            ->selectRaw("$payFormat as month, SUM(montant) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $expenses = Depense::where('user_id', $userId)
            ->whereBetween('date_depense', [$startDate, $endDate])
            ->selectRaw("$depFormat as month, SUM(montant) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        $data = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthKey = $driver === 'sqlite' ? str_pad($i, 2, '0', STR_PAD_LEFT) : (string) $i;
            $rev = (float) ($revenues[$monthKey] ?? 0);
            $exp = (float) ($expenses[$monthKey] ?? 0);
            $data[] = [
                'month' => $months[$i - 1],
                'month_number' => $i,
                'revenue' => $rev,
                'expenses' => $exp,
                'balance' => $rev - $exp,
            ];
        }

        return $data;
    }

    /**
     * Get expense breakdown by category for the year.
     */
    private function getAnnualExpenseCategories(int $userId, int $year): array
    {
        $startDate = "{$year}-01-01";
        $endDate = "{$year}-12-31";

        return Depense::where('user_id', $userId)
            ->whereBetween('date_depense', [$startDate, $endDate])
            ->select('categorie', DB::raw('SUM(montant) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('categorie')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'category' => $item->categorie ?? 'Autres',
                'total' => (float) $item->total,
                'count' => (int) $item->count,
            ])
            ->toArray();
    }

    /**
     * Compare current year with previous year.
     */
    private function getYearComparison(int $userId, int $year): array
    {
        $prevYear = $year - 1;
        $currentStart = "{$year}-01-01";
        $currentEnd = "{$year}-12-31";
        $prevStart = "{$prevYear}-01-01";
        $prevEnd = "{$prevYear}-12-31";

        $current = DB::query()
            ->selectRaw('
                (SELECT COALESCE(SUM(montant), 0) FROM paiements WHERE user_id = ? AND date_paiement BETWEEN ? AND ?) as revenue,
                (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE user_id = ? AND date_depense BETWEEN ? AND ?) as expenses
            ', [$userId, $currentStart, $currentEnd, $userId, $currentStart, $currentEnd])
            ->first();

        $previous = DB::query()
            ->selectRaw('
                (SELECT COALESCE(SUM(montant), 0) FROM paiements WHERE user_id = ? AND date_paiement BETWEEN ? AND ?) as revenue,
                (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE user_id = ? AND date_depense BETWEEN ? AND ?) as expenses
            ', [$userId, $prevStart, $prevEnd, $userId, $prevStart, $prevEnd])
            ->first();

        $revenueChange = $previous->revenue > 0
            ? round((($current->revenue - $previous->revenue) / $previous->revenue) * 100, 1)
            : ($current->revenue > 0 ? 100 : 0);

        $expenseChange = $previous->expenses > 0
            ? round((($current->expenses - $previous->expenses) / $previous->expenses) * 100, 1)
            : ($current->expenses > 0 ? 100 : 0);

        return [
            'previous_year' => $prevYear,
            'previous_revenue' => (float) $previous->revenue,
            'previous_expenses' => (float) $previous->expenses,
            'revenue_change_percent' => $revenueChange,
            'expense_change_percent' => $expenseChange,
        ];
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
                'title' => "Paiement de l'appartement " . ($p->resident?->appartement?->number ?? '—'),
                'subtitle' => "Appt " . ($p->resident?->appartement?->number ?? '-') . " • " . $p->montant . " MAD",
                'status' => $p->statut,
                'date' => $p->created_at->diffForHumans(),
            ])
            ->toArray();
    }
}
