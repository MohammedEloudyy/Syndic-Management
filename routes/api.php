<?php

use App\Http\Controllers\Api\AppartementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepenseController;
use App\Http\Controllers\Api\ImmeubleController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\ResidentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/user', fn(\Illuminate\Http\Request $r) => $r->user());

    Route::apiResource('immeubles', ImmeubleController::class);
    Route::apiResource('appartements', AppartementController::class);
    Route::apiResource('residents', ResidentController::class);
    Route::apiResource('paiements', PaiementController::class);
    Route::apiResource('depenses', DepenseController::class);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});

