<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Resident\ResidentIndexRequest;
use App\Http\Requests\Api\Resident\ResidentStoreRequest;
use App\Http\Requests\Api\Resident\ResidentUpdateRequest;
use App\Http\Resources\ResidentResource;
use App\Models\Resident;
use App\Services\ResidentService;
use Illuminate\Http\JsonResponse;

class ResidentController extends Controller
{
    public function index(ResidentIndexRequest $request, ResidentService $residentService): JsonResponse
    {
        $this->authorize('viewAny', Resident::class);

        return $this->jsonPaginated(
            $residentService->paginate($request->validated()),
            ResidentResource::class,
        );
    }

    public function show(Resident $resident): JsonResponse
    {
        $this->authorize('view', $resident);

        return ResidentResource::make($resident->load(['appartement.immeuble', 'paiements']))->response();
    }

    public function store(ResidentStoreRequest $request, ResidentService $residentService): JsonResponse
    {
        $this->authorize('create', Resident::class);

        return ResidentResource::make($residentService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function update(ResidentUpdateRequest $request, Resident $resident, ResidentService $residentService): JsonResponse
    {
        $this->authorize('update', $resident);

        return ResidentResource::make($residentService->update($resident, $request->validated()))->response();
    }

    public function destroy(Resident $resident, ResidentService $residentService): JsonResponse
    {
        $this->authorize('delete', $resident);

        $residentService->delete($resident);

        return response()->json(null, 204);
    }
}
