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
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'stats' => [
                        'counts' => ['buildings', 'apartments', 'residents'],
                        'finances' => ['revenue', 'expenses', 'balance'],
                        'payment_distribution',
                    ],
                    'charts',
                    'recent_activities',
                ],
            ]);
    }

    public function test_dashboard_returns_correct_counts(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/overview');

        $stats = $response->json('data.stats');

        $this->assertEquals(1, $stats['counts']['buildings']);
        $this->assertEquals(1, $stats['counts']['apartments']);
        $this->assertEquals(1, $stats['counts']['residents']);
        $this->assertEquals(500, $stats['finances']['revenue']);
        $this->assertEquals(200, $stats['finances']['expenses']);
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

        $response = $this->actingAs($this->user)->getJson('/api/dashboard/overview');

        // Should still be 1 immeuble (ours), not 2
        $this->assertEquals(1, $response->json('data.stats.counts.buildings'));
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard/overview');

        $response->assertStatus(401);
    }

    public function test_monthly_stats_has_six_months(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/dashboard/overview');

        $monthlyStats = $response->json('data.charts');

        $this->assertCount(6, $monthlyStats);
        $this->assertArrayHasKey('month', $monthlyStats[0]);
        $this->assertArrayHasKey('paiements', $monthlyStats[0]);
        $this->assertArrayHasKey('depenses', $monthlyStats[0]);
    }
}
