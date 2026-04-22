<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Immeuble\ImmeubleIndexRequest;
use App\Http\Requests\Api\Immeuble\ImmeubleStoreRequest;
use App\Http\Requests\Api\Immeuble\ImmeubleUpdateRequest;
use App\Http\Resources\ImmeubleResource;
use App\Models\Immeuble;
use App\Services\ImmeubleService;
use Illuminate\Http\JsonResponse;

class ImmeubleController extends Controller
{
    public function index(ImmeubleIndexRequest $request, ImmeubleService $immeubleService): JsonResponse
    {
        $this->authorize('viewAny', Immeuble::class);

        return $this->jsonPaginated(
            $immeubleService->paginate($request->validated()),
            ImmeubleResource::class,
        );
    }

    public function show(Immeuble $immeuble): JsonResponse
    {
        $this->authorize('view', $immeuble);

        return ImmeubleResource::make(
            $immeuble->load([
                'appartements',
                'depenses',
            ]),
        )->response();
    }

    public function store(ImmeubleStoreRequest $request, ImmeubleService $immeubleService): JsonResponse
    {
        $this->authorize('create', Immeuble::class);

        return ImmeubleResource::make($immeubleService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function update(ImmeubleUpdateRequest $request, Immeuble $immeuble, ImmeubleService $immeubleService): JsonResponse
    {
        $this->authorize('update', $immeuble);

        return ImmeubleResource::make($immeubleService->update($immeuble, $request->validated()))->response();
    }

    public function destroy(Immeuble $immeuble, ImmeubleService $immeubleService): JsonResponse
    {
        $this->authorize('delete', $immeuble);

        $immeubleService->delete($immeuble);

        return response()->json(null, 204);
    }
}
