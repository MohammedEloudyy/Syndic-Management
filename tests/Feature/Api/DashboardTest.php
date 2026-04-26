<?php

namespace Tests\Feature\Api;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Resident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Seed some data
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

        $resident = Resident::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'appartement_id' => $appartement->id,
            'full_name' => 'Test Resident',
            'email' => 'resident@test.com',
            'phone' => '0600000001',
            'entry_date' => '2025-01-01',
            'monthly_charge' => 500,
        ]);

        Paiement::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'resident_id' => $resident->id,
            'montant' => 500,
            'date_paiement' => now()->toDateString(),
            'statut' => 'payé',
        ]);

        Depense::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'immeuble_id' => $immeuble->id,
            'titre' => 'Test Depense',
            'montant' => 200,
            'date_depense' => now()->toDateString(),
            'categorie' => 'Maintenance',
        ]);
    }

    public function test_dashboard_returns_correct_structure(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_immeubles',
                    'total_appartements',
                    'total_residents',
                    'total_paiements',
                    'total_depenses',
                    'payment_status_stats',
                    'monthly_stats',
                ],
            ]);
    }

    public function test_dashboard_returns_correct_counts(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/stats');

        $data = $response->json('data');

        $this->assertEquals(1, $data['total_immeubles']);
        $this->assertEquals(1, $data['total_appartements']);
        $this->assertEquals(1, $data['total_residents']);
        $this->assertEquals(500, $data['total_paiements']);
        $this->assertEquals(200, $data['total_depenses']);
    }

    public function test_dashboard_isolates_user_data(): void
    {
        $otherUser = User::factory()->create();

        // Other user creates data — should NOT appear in our dashboard
        $otherImmeuble = Immeuble::create([
            'id' => (string) Str::uuid(),
            'user_id' => $otherUser->id,
            'name' => 'Other Building',
            'address' => '2 Rue Other',
            'city' => 'Rabat',
            'apartment_count' => 3,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/dashboard/stats');

        // Should still be 1 immeuble (ours), not 2
        $this->assertEquals(1, $response->json('data.total_immeubles'));
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(401);
    }

    public function test_monthly_stats_has_six_months(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/stats');

        $monthlyStats = $response->json('data.monthly_stats');

        $this->assertCount(6, $monthlyStats);
        $this->assertArrayHasKey('month', $monthlyStats[0]);
        $this->assertArrayHasKey('paiements', $monthlyStats[0]);
        $this->assertArrayHasKey('depenses', $monthlyStats[0]);
    }
}
