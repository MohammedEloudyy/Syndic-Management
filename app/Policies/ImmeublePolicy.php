<?php

namespace App\Policies;

use App\Models\Immeuble;
use App\Models\User;

class ImmeublePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Immeuble $immeuble): bool
    {
        return $user->id === $immeuble->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Immeuble $immeuble): bool
    {
        return $user->id === $immeuble->user_id;
    }

    public function delete(User $user, Immeuble $immeuble): bool
    {
        return $user->id === $immeuble->user_id;
    }
}
