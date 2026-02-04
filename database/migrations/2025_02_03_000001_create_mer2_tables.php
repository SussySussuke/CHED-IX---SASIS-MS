<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * MER2 Migration - HEI Directory of SAS
     * 
     * Structure:
     * - mer2_submissions (main table with status, notes, student counts)
     * - mer2_personnel (single table for all 4 office types with discriminator)
     */
    public function up(): void
    {
        // ========================================
        // MAIN TABLE: mer2_submissions
        // ========================================
        Schema::create('mer2_submissions', function (Blueprint $table) {
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
            
            // Summary Fields - Total Students Handled per Office
            // These are manually inputted by the user
            $table->integer('office_student_affairs_students_handled')->nullable();
            $table->integer('guidance_office_students_handled')->nullable();
            $table->integer('career_dev_center_students_handled')->nullable();
            $table->integer('student_dev_welfare_students_handled')->nullable();
            
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
            $table->unique(['hei_id', 'academic_year'], 'mer2_hei_year_unique');
            
            // Composite index for common queries
            $table->index(['hei_id', 'academic_year', 'status'], 'mer2_hei_year_status_idx');
        });

        // ========================================
        // CHILD TABLE: mer2_personnel
        // Single table for ALL office types
        // ========================================
        Schema::create('mer2_personnel', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to parent submission
            $table->unsignedBigInteger('mer2_submission_id');
            
            // Office Type Discriminator
            // Determines which of the 4 tables this row belongs to
            $table->enum('office_type', [
                'office_student_affairs',       // Table 1: Office of Student Affairs
                'guidance_office',              // Table 2: Guidance Office
                'career_dev_center',            // Table 3: Career Development Center
                'student_dev_welfare'           // Table 4: Student Development and Welfare Office
            ]);
            
            // ========================================
            // PERSONNEL DATA COLUMNS
            // (Identical for all 4 office types)
            // ========================================
            
            // Basic Information
            $table->string('name_of_personnel')->nullable();
            $table->string('position_designation')->nullable();
            $table->string('tenure_nature_of_appointment')->nullable();
            
            // Years of Service
            $table->integer('years_in_office')->nullable(); // "No. of Years in the Office/Unit/SAS Service"
            
            // Qualification
            $table->string('qualification_highest_degree')->nullable(); // "Qualification/Highest degree"
            
            // ========================================
            // LICENSE/ELIGIBILITY (Grouped Header)
            // ========================================
            $table->string('license_no_type')->nullable();      // "License No. Type"
            $table->date('license_expiry_date')->nullable();    // "Expiry Date"
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer2_submission_id')
                  ->references('id')
                  ->on('mer2_submissions')
                  ->onDelete('cascade');
            
            // Indexes for performance
            $table->index('mer2_submission_id', 'mer2_personnel_submission_idx');
            
            // Compound index for filtering by submission + office type
            $table->index(
                ['mer2_submission_id', 'office_type'], 
                'mer2_personnel_submission_office_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mer2_personnel');
        Schema::dropIfExists('mer2_submissions');
    }
};
