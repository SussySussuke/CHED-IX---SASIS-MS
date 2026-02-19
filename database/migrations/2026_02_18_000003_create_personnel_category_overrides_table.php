<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel_category_overrides', function (Blueprint $table) {
            $table->id();

            // FK to mer2_personnel.id — one override row per personnel record
            $table->unsignedBigInteger('personnel_id');

            // JSON array of manually assigned categories (null = reset to keyword matching)
            $table->json('manual_categories')->nullable();

            // Audit
            $table->unsignedBigInteger('overridden_by')->nullable();
            $table->timestamp('overridden_at')->nullable();

            $table->timestamps();

            // One override per personnel row
            $table->unique('personnel_id');

            $table->foreign('personnel_id')
                  ->references('id')
                  ->on('mer2_personnel')
                  ->onDelete('cascade');

            $table->foreign('overridden_by')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();

            $table->index('personnel_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel_category_overrides');
    }
};
