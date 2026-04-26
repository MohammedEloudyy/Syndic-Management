<?php

namespace Tests\Feature\Api;

use App\Models\Appartement;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PaiementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Resident $resident;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        $immeuble = Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'name' => 'Test Building',
            'address' => '1 Rue Test',
            'city' => 'Casablanca',
            'apartment_count' => 5,
        ]);

        $appartement = Appartement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'immeuble_id' => $immeuble->id,
            'number' => 'A101',
            'floor' => 1,
            'surface' => 65,
            'rooms' => 3,
            'status' => 'occupé',
        ]);

        $this->resident = Resident::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'appartement_id' => $appartement->id,
            'full_name' => 'Test Resident',
            'email' => 'resident@test.com',
            'phone' => '0600000001',
            'entry_date' => '2025-01-01',
            'monthly_charge' => 500,
        ]);
    }

    public function test_can_create_paiement(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/paiements', [
            'resident_id' => $this->resident->id,
            'montant' => 500,
            'date_paiement' => '2026-04-01',
            'statut' => 'payé',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.montant', 500);
    }

    public function test_can_list_paiements_with_stats(): void
    {
        Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 500,
            'date_paiement' => '2026-04-01',
            'statut' => 'payé',
        ]);

        Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 300,
            'date_paiement' => '2026-04-15',
            'statut' => 'en_attente',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/paiements');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total', 'stats'],
            ]);

        // Verify stats
        $this->assertEquals(800, $response->json('meta.stats.total'));
        $this->assertEquals(500, $response->json('meta.stats.paid'));
        $this->assertEquals(300, $response->json('meta.stats.pending'));
    }

    public function test_can_filter_by_statut(): void
    {
        Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 500,
            'date_paiement' => '2026-04-01',
            'statut' => 'payé',
        ]);

        Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 300,
            'date_paiement' => '2026-04-15',
            'statut' => 'en_retard',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/paiements?statut=en_retard');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.statut', 'en_retard');
    }

    public function test_can_update_paiement(): void
    {
        $paiement = Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 500,
            'date_paiement' => '2026-04-01',
            'statut' => 'en_attente',
        ]);

        $response = $this->actingAs($this->user)->putJson("/api/paiements/{$paiement->id}", [
            'statut' => 'payé',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'payé');
    }

    public function test_can_delete_paiement(): void
    {
        $paiement = Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $this->resident->id,
            'montant' => 500,
            'date_paiement' => '2026-04-01',
            'statut' => 'payé',
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/paiements/{$paiement->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('paiements', ['id' => $paiement->id]);
    }
}
