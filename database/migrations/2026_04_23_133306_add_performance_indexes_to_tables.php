<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Safely add indexes
        $this->addIndex('residents', 'full_name');
        $this->addIndex('residents', 'email');
        $this->addIndex('paiements', 'statut');
        $this->addIndex('paiements', 'date_paiement');
        $this->addIndex('depenses', 'date_depense');
        $this->addIndex('immeubles', 'ville');
    }

    private function addIndex($table, $column)
    {
        try {
            Schema::table($table, function (Blueprint $tableBP) use ($column) {
                $tableBP->index($column);
            });
        } catch (\Exception $e) {
            // Ignore if index already exists
        }
    }

    public function down(): void
    {
        $this->dropIndex('residents', 'full_name');
        $this->dropIndex('residents', 'email');
        $this->dropIndex('paiements', 'statut');
        $this->dropIndex('paiements', 'date_paiement');
        $this->dropIndex('depenses', 'date_depense');
        $this->dropIndex('immeubles', 'ville');
    }

    private function dropIndex($table, $column)
    {
        try {
            Schema::table($table, function (Blueprint $tableBP) use ($column) {
                $tableBP->dropIndex([$column]);
            });
        } catch (\Exception $e) {
            // Ignore if index doesn't exist
        }
    }
};
