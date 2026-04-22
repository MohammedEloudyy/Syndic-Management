<?php

namespace App\Providers;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Policies\AppartementPolicy;
use App\Policies\DepensePolicy;
use App\Policies\ImmeublePolicy;
use App\Policies\PaiementPolicy;
use App\Policies\ResidentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Immeuble::class => ImmeublePolicy::class,
        Appartement::class => AppartementPolicy::class,
        Resident::class => ResidentPolicy::class,
        Paiement::class => PaiementPolicy::class,
        Depense::class => DepensePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Route::bind('immeuble', function (string $value) {
            return Immeuble::query()
                ->where('user_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });

        Route::bind('appartement', function (string $value) {
            return Appartement::query()
                ->where('user_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });

        Route::bind('resident', function (string $value) {
            return Resident::query()
                ->where('user_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });

        Route::bind('paiement', function (string $value) {
            return Paiement::query()
                ->where('user_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });

        Route::bind('depense', function (string $value) {
            return Depense::query()
                ->where('user_id', auth()->id())
                ->whereKey($value)
                ->firstOrFail();
        });
    }
}
