<?php

namespace App\Policies;

use App\Models\Appartement;
use App\Models\User;

class AppartementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Appartement $appartement): bool
    {
        return $user->id === $appartement->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Appartement $appartement): bool
    {
        return $user->id === $appartement->user_id;
    }

    public function delete(User $user, Appartement $appartement): bool
    {
        return $user->id === $appartement->user_id;
    }
}
