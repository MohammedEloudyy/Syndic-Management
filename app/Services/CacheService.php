<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * CacheService
 * 
 * Orchestrates granular cache management and invalidation patterns.
 */
class CacheService
{
    /**
     * Cache Key Namespaces
     */
    const KEY_DASHBOARD_OVERVIEW = 'dashboard_overview';
    const KEY_ENTITY_STATS = 'entity_stats';

    /**
     * Invalidate all dashboard-related data for a specific user.
     */
    public function invalidateUserDashboard(int $userId): void
    {
        Cache::forget($this->getDashboardKey($userId));
    }

    /**
     * Get a standardized dashboard key.
     */
    public function getDashboardKey(int $userId): string
    {
        return self::KEY_DASHBOARD_OVERVIEW . ":user:{$userId}";
    }

    /**
     * Invalidate granular parts if needed (Future proofing)
     */
    public function invalidateStats(int $userId): void
    {
        Cache::forget(self::KEY_ENTITY_STATS . ":user:{$userId}");
    }
}
