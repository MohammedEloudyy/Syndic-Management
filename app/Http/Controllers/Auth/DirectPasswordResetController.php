<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class DirectPasswordResetController extends Controller
{
    /**
     * Reset a user's password directly (no email/token required).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'errors' => ['email' => ['Aucun compte trouvé avec cette adresse email.']],
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($request->string('password')),
        ])->save();

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }
}
