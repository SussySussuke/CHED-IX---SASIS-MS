<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_category_overrides', function (Blueprint $table) {
            $table->id();

            // Which program is being overridden
            $table->enum('program_type', ['annex_a', 'annex_b']);
            $table->unsignedBigInteger('program_id');

            // The manually assigned category (null = reset to keyword matching)
            $table->string('manual_category')->nullable();

            // Audit
            $table->unsignedBigInteger('overridden_by')->nullable();
            $table->timestamp('overridden_at')->nullable();

            $table->timestamps();

            // One override per program
            $table->unique(['program_type', 'program_id']);

            // FK to users (soft reference — no cascade needed)
            $table->foreign('overridden_by')->references('id')->on('users')->nullOnDelete();

            // Index for fast lookups during aggregation
            $table->index(['program_type', 'program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_category_overrides');
    }
};
