<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MER3 Migration - Matrix of School Fees for SAS Programs and Activities
     * 
     * Structure:
     * - mer3_submissions (main table with status, notes)
     * - mer3_school_fees (school fees data)
     */
    public function up(): void
    {
        // ========================================
        // MAIN TABLE: mer3_submissions
        // ========================================
        Schema::create('mer3_submissions', function (Blueprint $table) {
            $table->id();
            
            // Core fields
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year'); // e.g., "2024-2025"
            
            // Status workflow
            $table->enum('status', [
                'pending',      // Draft/In Progress
                'submitted',    // Submitted to CHED
                'request',      // Request for changes
                'approved',     // Approved by CHED
                'published',    // Published/Final
                'rejected',     // Rejected by CHED
                'cancelled'     // Cancelled by HEI
            ])->default('pending');
            
            // Notes/Comments (for workflow communication)
            $table->text('request_notes')->nullable();      // HEI notes when submitting
            $table->text('cancelled_notes')->nullable();    // Reason for cancellation
            $table->text('admin_notes')->nullable();        // CHED admin notes
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('hei_id')
                  ->references('id')
                  ->on('heis')
                  ->onDelete('cascade');
            
            // Ensure one submission per year per HEI
            $table->unique(['hei_id', 'academic_year'], 'mer3_hei_year_unique');
            
            // Composite index for common queries
            $table->index(['hei_id', 'academic_year', 'status'], 'mer3_hei_year_status_idx');
        });

        // ========================================
        // CHILD TABLE: mer3_school_fees
        // School fees data table
        // ========================================
        Schema::create('mer3_school_fees', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to parent submission
            $table->unsignedBigInteger('mer3_submission_id');
            
            // ========================================
            // SCHOOL FEES DATA COLUMNS
            // ========================================
            
            $table->string('name_of_school_fees')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2)->nullable(); // Using decimal for monetary values
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer3_submission_id')
                  ->references('id')
                  ->on('mer3_submissions')
                  ->onDelete('cascade');
            
            // Index for performance
            $table->index('mer3_submission_id', 'mer3_fees_submission_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mer3_school_fees');
        Schema::dropIfExists('mer3_submissions');
    }
};
