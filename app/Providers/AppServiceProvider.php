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
            return config('app.frontend_url')."/reset-password?token={$token}&email=".urlencode($notifiable->getEmailForPasswordReset());
        });

        // Automatically handle local development network/IP access for Sanctum & CORS
        if ($this->app->environment('local') && !$this->app->runningInConsole()) {
            $request = request();
            $host = $request->getHost();
            
            if ($host) {
                $port = $request->getPort();
                $hostWithPort = $port ? "$host:$port" : $host;
                
                // Add the current host to Sanctum's stateful domains
                $stateful = config('sanctum.stateful', []);
                if (is_string($stateful)) {
                    $stateful = explode(',', $stateful);
                }
                $stateful = is_array($stateful) ? $stateful : [];
                
                if (!in_array($hostWithPort, $stateful)) {
                    $stateful[] = $hostWithPort;
                }
                if (!in_array($host, $stateful)) {
                    $stateful[] = $host;
                }
                
                // Also parse Origin and Referer headers to register them as stateful
                foreach (['origin', 'referer'] as $header) {
                    $url = $request->headers->get($header);
                    if ($url) {
                        $parsedHost = parse_url($url, PHP_URL_HOST);
                        $parsedPort = parse_url($url, PHP_URL_PORT);
                        if ($parsedHost) {
                            $originHostWithPort = $parsedPort ? "$parsedHost:$parsedPort" : $parsedHost;
                            if (!in_array($originHostWithPort, $stateful)) {
                                $stateful[] = $originHostWithPort;
                            }
                            if (!in_array($parsedHost, $stateful)) {
                                $stateful[] = $parsedHost;
                            }
                            
                            // Dynamically allow this origin in CORS config
                            $scheme = parse_url($url, PHP_URL_SCHEME);
                            $corsOrigin = "$scheme://$originHostWithPort";
                            $corsOrigins = config('cors.allowed_origins', []);
                            if (!in_array($corsOrigin, $corsOrigins)) {
                                $corsOrigins[] = $corsOrigin;
                                config(['cors.allowed_origins' => $corsOrigins]);
                            }
                        }
                    }
                }
                
                config(['sanctum.stateful' => $stateful]);
            }
        }

        // Register Dashboard Data Observers for cache invalidation
        Paiement::observe(DashboardDataObserver::class);
        Depense::observe(DashboardDataObserver::class);
        Immeuble::observe(DashboardDataObserver::class);
        Appartement::observe(DashboardDataObserver::class);
        Resident::observe(DashboardDataObserver::class);
    }
}
