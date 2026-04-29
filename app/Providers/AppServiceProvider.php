<?php

namespace App\Providers;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Observers\DashboardDataObserver;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        // Register Dashboard Data Observers for cache invalidation
        Paiement::observe(DashboardDataObserver::class);
        Depense::observe(DashboardDataObserver::class);
        Immeuble::observe(DashboardDataObserver::class);
        Appartement::observe(DashboardDataObserver::class);
        Resident::observe(DashboardDataObserver::class);
    }
}
