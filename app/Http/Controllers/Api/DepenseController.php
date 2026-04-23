<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Depense\DepenseIndexRequest;
use App\Http\Requests\Api\Depense\DepenseStoreRequest;
use App\Http\Requests\Api\Depense\DepenseUpdateRequest;
use App\Http\Resources\DepenseResource;
use App\Models\Depense;
use App\Services\DepenseService;
use Illuminate\Http\JsonResponse;

class DepenseController extends Controller
{
    public function index(DepenseIndexRequest $request, DepenseService $depenseService): JsonResponse
    {
        $this->authorize('viewAny', Depense::class);

        $validated = $request->validated();

        return $this->jsonPaginated(
            $depenseService->paginate($validated),
            DepenseResource::class,
            ['stats' => $depenseService->stats($validated)]
        );
    }

    public function show(Depense $depense): JsonResponse
    {
        $this->authorize('view', $depense);

        return DepenseResource::make($depense->load('immeuble'))->response();
    }

    public function store(DepenseStoreRequest $request, DepenseService $depenseService): JsonResponse
    {
        $this->authorize('create', Depense::class);

        return DepenseResource::make($depenseService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function update(DepenseUpdateRequest $request, Depense $depense, DepenseService $depenseService): JsonResponse
    {
        $this->authorize('update', $depense);

        return DepenseResource::make($depenseService->update($depense, $request->validated()))->response();
    }

    public function destroy(Depense $depense, DepenseService $depenseService): JsonResponse
    {
        $this->authorize('delete', $depense);

        $depenseService->delete($depense);

        return response()->json(null, 204);
    }
}
