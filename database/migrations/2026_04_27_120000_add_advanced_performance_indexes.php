<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Composite indexes for fast filtering and dashboard aggregation
        $this->safeIndex('paiements', ['user_id', 'statut', 'date_paiement']);
        $this->safeIndex('paiements', ['user_id', 'date_paiement']);
        $this->safeIndex('depenses', ['user_id', 'date_depense']);
        $this->safeIndex('depenses', ['user_id', 'categorie']);
        $this->safeIndex('appartements', ['user_id', 'immeuble_id', 'statut']);
        $this->safeIndex('residents', ['user_id', 'appartement_id']);
    }

    private function safeIndex(string $table, array $columns): void
    {
        try {
            Schema::table($table, function (Blueprint $tableBP) use ($columns) {
                $tableBP->index($columns);
            });
        } catch (\Exception $e) {
            // Index likely exists, skip safely
        }
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'statut', 'date_paiement']);
            $table->dropIndex(['user_id', 'date_paiement']);
        });

        Schema::table('depenses', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date_depense']);
            $table->dropIndex(['user_id', 'categorie']);
        });

        Schema::table('appartements', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'immeuble_id', 'statut']);
        });

        Schema::table('residents', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'appartement_id']);
        });
    }
};
