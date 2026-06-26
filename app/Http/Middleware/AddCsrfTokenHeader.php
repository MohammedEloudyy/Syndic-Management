<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddCsrfTokenHeader
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Append the raw CSRF token to the response headers on the CSRF cookie endpoint
        if ($request->is('sanctum/csrf-cookie') || $request->is('api/sanctum/csrf-cookie')) {
            $response->headers->set('X-CSRF-Token', csrf_token());
        }

        return $response;
    }
}
