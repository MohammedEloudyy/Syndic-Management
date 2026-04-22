<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appartements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('immeuble_id')->constrained('immeubles')->cascadeOnDelete();
            $table->string('number');
            $table->unsignedInteger('floor')->default(0);
            $table->unsignedInteger('surface')->default(0);
            $table->unsignedInteger('rooms')->default(0);
            $table->string('status')->default('vacant');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appartements');
    }
};
