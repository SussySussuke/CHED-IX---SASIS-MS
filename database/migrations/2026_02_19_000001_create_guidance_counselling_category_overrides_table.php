<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guidance_counselling_category_overrides', function (Blueprint $table) {
            $table->id();

            // Annex B program being overridden
            $table->unsignedBigInteger('program_id');

            // Manually assigned guidance counselling categories (null = reset to keyword matching)
            $table->json('manual_categories')->nullable();

            // Audit
            $table->unsignedBigInteger('overridden_by')->nullable();
            $table->timestamp('overridden_at')->nullable();

            $table->timestamps();

            // One override per program
            $table->unique('program_id');

            $table->foreign('overridden_by')->references('id')->on('users')->nullOnDelete();
            $table->index('program_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guidance_counselling_category_overrides');
    }
};
