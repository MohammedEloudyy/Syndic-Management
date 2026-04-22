<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Paiement\PaiementIndexRequest;
use App\Http\Requests\Api\Paiement\PaiementStoreRequest;
use App\Http\Requests\Api\Paiement\PaiementUpdateRequest;
use App\Http\Resources\PaiementResource;
use App\Models\Paiement;
use App\Services\PaiementService;
use Illuminate\Http\JsonResponse;

class PaiementController extends Controller
{
    public function index(PaiementIndexRequest $request, PaiementService $paiementService): JsonResponse
    {
        $this->authorize('viewAny', Paiement::class);

        return $this->jsonPaginated(
            $paiementService->paginate($request->validated()),
            PaiementResource::class,
        );
    }

    public function show(Paiement $paiement): JsonResponse
    {
        $this->authorize('view', $paiement);

        return PaiementResource::make($paiement->load(['resident.appartement.immeuble']))->response();
    }

    public function store(PaiementStoreRequest $request, PaiementService $paiementService): JsonResponse
    {
        $this->authorize('create', Paiement::class);

        return PaiementResource::make($paiementService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function update(PaiementUpdateRequest $request, Paiement $paiement, PaiementService $paiementService): JsonResponse
    {
        $this->authorize('update', $paiement);

        return PaiementResource::make($paiementService->update($paiement, $request->validated()))->response();
    }

    public function destroy(Paiement $paiement, PaiementService $paiementService): JsonResponse
    {
        $this->authorize('delete', $paiement);

        $paiementService->delete($paiement);

        return response()->json(null, 204);
    }
}
