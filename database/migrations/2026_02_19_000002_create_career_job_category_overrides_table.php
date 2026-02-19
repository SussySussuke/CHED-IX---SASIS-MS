<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('career_job_category_overrides', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('program_id');
            $table->json('manual_categories')->nullable();

            $table->unsignedBigInteger('overridden_by')->nullable();
            $table->timestamp('overridden_at')->nullable();

            $table->timestamps();

            $table->unique('program_id');

            $table->foreign('overridden_by')->references('id')->on('users')->nullOnDelete();
            $table->index('program_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('career_job_category_overrides');
    }
};
