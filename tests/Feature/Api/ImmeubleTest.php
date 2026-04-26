<?php

namespace Tests\Feature\Api;

use App\Models\Immeuble;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ImmeubleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    public function test_can_list_own_immeubles(): void
    {
        Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'name' => 'Résidence Test',
            'address' => '10 Rue Test',
            'city' => 'Casablanca',
            'apartment_count' => 5,
        ]);

        // Other user's immeuble — should NOT appear
        Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->otherUser->id,
            'name' => 'Résidence Autre',
            'address' => '20 Rue Autre',
            'city' => 'Rabat',
            'apartment_count' => 3,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/immeubles');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Résidence Test');
    }

    public function test_can_create_immeuble(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/immeubles', [
            'name' => 'Nouveau Immeuble',
            'address' => '5 Avenue Test',
            'city' => 'Marrakech',
            'apartment_count' => 10,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Nouveau Immeuble');

        $this->assertDatabaseHas('immeubles', [
            'name' => 'Nouveau Immeuble',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_can_update_own_immeuble(): void
    {
        $immeuble = Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'name' => 'Old Name',
            'address' => '10 Rue Old',
            'city' => 'Casablanca',
            'apartment_count' => 5,
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/immeubles/{$immeuble->id}", [
            'name' => 'Updated Name',
            'address' => '10 Rue Old',
            'city' => 'Casablanca',
            'apartment_count' => 5,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_cannot_access_other_users_immeuble(): void
    {
        $immeuble = Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->otherUser->id,
            'name' => 'Private Building',
            'address' => '1 Rue Secret',
            'city' => 'Fes',
            'apartment_count' => 2,
        ]);

        $response = $this->actingAs($this->user)->getJson("/api/immeubles/{$immeuble->id}");

        $response->assertStatus(404);
    }

    public function test_can_delete_own_immeuble(): void
    {
        $immeuble = Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'name' => 'To Delete',
            'address' => '99 Rue Delete',
            'city' => 'Tanger',
            'apartment_count' => 1,
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/immeubles/{$immeuble->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('immeubles', ['id' => $immeuble->id]);
    }

    public function test_guest_cannot_list_immeubles(): void
    {
        $response = $this->getJson('/api/immeubles');

        $response->assertStatus(401);
    }
}
