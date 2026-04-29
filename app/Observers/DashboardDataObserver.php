<?php

namespace App\Observers;

use App\Events\DashboardDataChanged;

class DashboardDataObserver
{
    /**
     * Handle the model "saved" event (created or updated).
     */
    public function saved($model): void
    {
        if (isset($model->user_id)) {
            DashboardDataChanged::dispatch($model->user_id);
        }
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted($model): void
    {
        if (isset($model->user_id)) {
            DashboardDataChanged::dispatch($model->user_id);
        }
    }
}
