<?php

namespace Database\Seeders;

use App\Models\Appartement;
use App\Models\Depense;
use App\Models\Immeuble;
use App\Models\Paiement;
use App\Models\Permission;
use App\Models\Resident;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SyndicDemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles & Permissions ─────────────────────────────────
        $adminRole = Role::query()->updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrateur'],
        );

        $syndicRole = Role::query()->updateOrCreate(
            ['slug' => 'syndic'],
            ['name' => 'Syndic'],
        );

        $permissionSlugs = [
            'manage_immeubles' => 'Gérer les immeubles',
            'manage_appartements' => 'Gérer les appartements',
            'manage_residents' => 'Gérer les résidents',
            'manage_paiements' => 'Gérer les paiements',
            'manage_depenses' => 'Gérer les dépenses',
            'view_dashboard' => 'Voir le tableau de bord',
        ];

        $permissions = [];
        foreach ($permissionSlugs as $slug => $name) {
            $permissions[] = Permission::query()->updateOrCreate(
                ['slug' => $slug],
                ['name' => $name],
            );
        }

        // Admin gets all permissions
        $adminRole->permissions()->sync(collect($permissions)->pluck('id'));
        // Syndic gets all permissions too (can be restricted later)
        $syndicRole->permissions()->sync(collect($permissions)->pluck('id'));

        // ── Demo User ──────────────────────────────────────────
        $user = User::query()->updateOrCreate(
            ['email' => 'demo@syndic.ma'],
            [
                'name' => 'Demo Syndic',
                'password' => Hash::make('password'),
            ],
        );

        // Assign syndic role to demo user
        $user->roles()->syncWithoutDetaching([$syndicRole->id]);

        // ── Immeubles ──────────────────────────────────────────
        $addresses = [
            ['name' => 'Résidence Atlas', 'address' => '15 Rue Ibn Sina', 'city' => 'Casablanca'],
            ['name' => 'Résidence Palmier', 'address' => '8 Avenue Hassan II', 'city' => 'Rabat'],
        ];

        $immeubles = [];
        foreach ($addresses as $meta) {
            $immeubles[] = Immeuble::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'name' => $meta['name'],
                'address' => $meta['address'],
                'city' => $meta['city'],
                'apartment_count' => 5,
            ]);
        }

        // ── Appartements ───────────────────────────────────────
        $appartements = [];
        foreach ($immeubles as $bIndex => $immeuble) {
            for ($i = 1; $i <= 5; $i++) {
                $appartements[] = Appartement::query()->create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'immeuble_id' => $immeuble->id,
                    'number' => chr(64 + $bIndex + 1).str_pad((string) (100 + $i), 3, '0', STR_PAD_LEFT),
                    'floor' => ($i % 5) + 1,
                    'surface' => 55 + ($i * 8),
                    'rooms' => 2 + ($i % 3),
                    'status' => $i % 4 === 0 ? 'vacant' : 'occupé',
                ]);
            }
        }

        // ── Résidents ──────────────────────────────────────────
        $residents = [];
        for ($i = 1; $i <= 20; $i++) {
            $appartement = $appartements[($i - 1) % count($appartements)];
            $residents[] = Resident::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'appartement_id' => $appartement->id,
                'full_name' => "Resident {$i}",
                'email' => "resident{$i}@syndic.ma",
                'phone' => '060000'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'entry_date' => Carbon::now()->subMonths(rand(1, 24))->toDateString(),
                'monthly_charge' => 300 + (($i % 5) * 50),
            ]);
        }

        // ── Paiements (with en_retard variety) ─────────────────
        $statuts = ['payé', 'payé', 'en_attente', 'en_retard'];
        for ($i = 1; $i <= 40; $i++) {
            $resident = $residents[array_rand($residents)];
            Paiement::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'resident_id' => $resident->id,
                'montant' => rand(250, 900),
                'date_paiement' => Carbon::now()->subDays(rand(0, 180))->toDateString(),
                'statut' => $statuts[$i % count($statuts)],
            ]);
        }

        // ── Dépenses (with categories) ─────────────────────────
        $categories = ['Maintenance', 'Nettoyage', 'Électricité', 'Eau', 'Ascenseur', 'Sécurité', 'Jardinage', 'Autres'];
        for ($i = 1; $i <= 10; $i++) {
            $immeuble = $immeubles[array_rand($immeubles)];
            Depense::query()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'immeuble_id' => $immeuble->id,
                'titre' => "Dépense {$i}",
                'montant' => rand(400, 3500),
                'date_depense' => Carbon::now()->subDays(rand(0, 180))->toDateString(),
                'categorie' => $categories[$i % count($categories)],
            ]);
        }
    }
}
