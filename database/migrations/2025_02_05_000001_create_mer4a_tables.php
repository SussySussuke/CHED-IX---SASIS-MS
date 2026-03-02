<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MER4A Migration - Checklist of Compliance Requirements
     *
     * Structure:
     * - mer4a_submissions (main table)
     * - mer4a_sas_management_items (SAS management checklist rows)
     * - mer4a_guidance_counseling_items (Guidance counseling checklist rows)
     */
    public function up(): void
    {
        // ========================================
        // MAIN TABLE: mer4a_submissions
        // ========================================
        Schema::create('mer4a_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year');
            $table->enum('status', [
                'pending',
                'submitted',
                'request',
                'approved',
                'published',
                'rejected',
                'cancelled',
                'overwritten',
            ])->default('pending');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
            $table->index(['hei_id', 'academic_year', 'status'], 'mer4a_hei_year_status_idx');
        });

        // ========================================
        // CHILD TABLE: mer4a_sas_management_items
        // ========================================
        Schema::create('mer4a_sas_management_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer4a_submission_id');
            $table->string('row_id')->comment('Stable identifier for the checklist row, e.g. sas_001');
            $table->text('requirement')->nullable()->comment('The checklist requirement text');
            $table->string('evidence_file')->nullable()->comment('Path to uploaded evidence file');
            $table->boolean('status_compiled')->default(false);
            $table->text('hei_remarks')->nullable();
            $table->timestamps();

            $table->foreign('mer4a_submission_id')
                  ->references('id')
                  ->on('mer4a_submissions')
                  ->onDelete('cascade');
            $table->index('mer4a_submission_id', 'mer4a_sas_submission_idx');
        });

        // ========================================
        // CHILD TABLE: mer4a_guidance_counseling_items
        // ========================================
        Schema::create('mer4a_guidance_counseling_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer4a_submission_id');
            $table->string('row_id')->comment('Stable identifier for the checklist row, e.g. gc_001');
            $table->text('requirement')->nullable()->comment('The checklist requirement text');
            $table->string('evidence_file')->nullable()->comment('Path to uploaded evidence file');
            $table->boolean('status_compiled')->default(false);
            $table->text('hei_remarks')->nullable();
            $table->timestamps();

            $table->foreign('mer4a_submission_id')
                  ->references('id')
                  ->on('mer4a_submissions')
                  ->onDelete('cascade');
            $table->index('mer4a_submission_id', 'mer4a_gc_submission_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mer4a_guidance_counseling_items');
        Schema::dropIfExists('mer4a_sas_management_items');
        Schema::dropIfExists('mer4a_submissions');
    }
};
