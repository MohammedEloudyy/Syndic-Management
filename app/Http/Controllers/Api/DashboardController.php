<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Aggregated Dashboard Overview
     * Returns stats, charts, and recent activities in one call.
     */
    public function overview(Request $request, DashboardService $dashboardService): JsonResponse
    {
        return response()->json([
            'data' => $dashboardService->getOverview($request->user()),
        ]);
    }

    /**
     * Individual Stats (Fallback/Specific usage)
     */
    public function stats(Request $request, DashboardService $dashboardService): JsonResponse
    {
        return response()->json([
            'data' => $dashboardService->getOverview($request->user())['stats'],
        ]);
    }
}
