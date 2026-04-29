<?php

namespace App\Listeners;

use App\Events\DashboardDataChanged;
use App\Services\CacheService;

class RefreshDashboardCache
{
    /**
     * Create the event listener.
     */
    public function __construct(
        protected CacheService $cacheService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(DashboardDataChanged $event): void
    {
        $this->cacheService->invalidateUserDashboard($event->userId);
    }
}
