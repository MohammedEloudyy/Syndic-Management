<?php

namespace App\Policies;

use App\Models\Resident;
use App\Models\User;

class ResidentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Resident $resident): bool
    {
        return $user->id === $resident->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Resident $resident): bool
    {
        return $user->id === $resident->user_id;
    }

    public function delete(User $user, Resident $resident): bool
    {
        return $user->id === $resident->user_id;
    }
}
