<?php

use App\Http\Controllers\Api\AppartementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepenseController;
use App\Http\Controllers\Api\ImmeubleController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PublicStatsController;
use App\Http\Controllers\Api\ResidentController;
use Illuminate\Support\Facades\Route;

// Public route — aggressive rate limit, no auth needed
Route::middleware('throttle:10,1')->get('/public/stats', PublicStatsController::class);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    Route::get('/user', fn(\Illuminate\Http\Request $r) => $r->user());

    Route::apiResource('immeubles', ImmeubleController::class);
    Route::apiResource('appartements', AppartementController::class);
    Route::apiResource('residents', ResidentController::class);
    Route::apiResource('paiements', PaiementController::class);
    Route::apiResource('depenses', DepenseController::class);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});

