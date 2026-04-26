<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use Illuminate\Http\JsonResponse;

/**
 * PublicStatsController — Minimal, non-sensitive aggregate stats
 *
 * Deliberately limited: only total counts, no user-specific data,
 * no financial amounts, no personal info. Safe for unauthenticated access.
 */
class PublicStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'total_immeubles' => Immeuble::count(),
            'total_residents' => Resident::count(),
            'payment_rate' => $this->paymentRate(),
        ]);
    }

    /**
     * Calculate the percentage of payments marked as "payé".
     */
    private function paymentRate(): int
    {
        $total = Paiement::count();

        if ($total === 0) {
            return 0;
        }

        $paid = Paiement::where('statut', 'payé')->count();

        return (int) round(($paid / $total) * 100);
    }
}
