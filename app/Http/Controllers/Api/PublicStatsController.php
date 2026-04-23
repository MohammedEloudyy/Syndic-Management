<?php
 
 namespace App\Http\Controllers\Api;
 
 use App\Http\Controllers\Controller;
 use App\Models\Immeuble;
 use App\Models\Resident;
 use App\Models\Paiement;
 use Illuminate\Http\JsonResponse;
 
 class PublicStatsController extends Controller
 {
     public function index(): JsonResponse
     {
         $totalImmeubles = Immeuble::count();
         $totalResidents = Resident::count();
         
         // Let's say we want to show a percentage of payments made overall or just total payments
         $totalPaiements = Paiement::count();
         $paidPaiements = Paiement::where('statut', 'payé')->count();
         $paymentRate = $totalPaiements > 0 ? round(($paidPaiements / $totalPaiements) * 100) : 100;
 
         return response()->json([
             'data' => [
                 'total_immeubles' => $totalImmeubles,
                 'total_residents' => $totalResidents,
                 'payment_rate' => $paymentRate,
             ]
         ]);
     }
 }
