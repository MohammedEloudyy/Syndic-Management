<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Appartement\AppartementIndexRequest;
use App\Http\Requests\Api\Appartement\AppartementStoreRequest;
use App\Http\Requests\Api\Appartement\AppartementUpdateRequest;
use App\Http\Resources\AppartementResource;
use App\Models\Appartement;
use App\Services\AppartementService;
use Illuminate\Http\JsonResponse;

class AppartementController extends Controller
{
    public function index(AppartementIndexRequest $request, AppartementService $appartementService): JsonResponse
    {
        $this->authorize('viewAny', Appartement::class);

        return $this->jsonPaginated(
            $appartementService->paginate($request->validated()),
            AppartementResource::class,
        );
    }

    public function show(Appartement $appartement): JsonResponse
    {
        $this->authorize('view', $appartement);

        return AppartementResource::make($appartement->load(['immeuble', 'residents']))->response();
    }

    public function store(AppartementStoreRequest $request, AppartementService $appartementService): JsonResponse
    {
        $this->authorize('create', Appartement::class);

        return AppartementResource::make($appartementService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function update(AppartementUpdateRequest $request, Appartement $appartement, AppartementService $appartementService): JsonResponse
    {
        $this->authorize('update', $appartement);

        return AppartementResource::make($appartementService->update($appartement, $request->validated()))->response();
    }

    public function destroy(Appartement $appartement, AppartementService $appartementService): JsonResponse
    {
        $this->authorize('delete', $appartement);

        $appartementService->delete($appartement);

        return response()->json(null, 204);
    }
}
