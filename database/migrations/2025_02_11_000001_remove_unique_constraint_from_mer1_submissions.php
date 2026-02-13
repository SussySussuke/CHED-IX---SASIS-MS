<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Remove unique constraint from mer1_submissions to allow multiple submissions
     * per HEI per year (with different statuses like 'submitted', 'published', 'overwritten').
     * 
     * This matches the pattern used in all Annex tables (A, C1, I1, L1, N1) which only
     * use indexes for query performance and handle uniqueness at the application level.
     */
    public function up(): void
    {
        Schema::table('mer1_submissions', function (Blueprint $table) {
            // Drop the unique constraint on (hei_id, academic_year)
            $table->dropUnique(['hei_id', 'academic_year']);
            
            // The index already exists from the migration, but let's ensure it's there
            // Index format: (hei_id, academic_year, status) for query optimization
            // This is already created in the original migration, so we don't need to add it again
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mer1_submissions', function (Blueprint $table) {
            // Re-add the unique constraint if rolling back
            $table->unique(['hei_id', 'academic_year']);
        });
    }
};
