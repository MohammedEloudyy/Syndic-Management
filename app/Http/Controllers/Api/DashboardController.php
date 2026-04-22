<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Dashboard\DashboardStatsRequest;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(DashboardStatsRequest $request, DashboardService $dashboardService): JsonResponse
    {
        $request->validated();

        return response()->json([
            'data' => $dashboardService->stats($request->user()),
        ]);
    }
}
