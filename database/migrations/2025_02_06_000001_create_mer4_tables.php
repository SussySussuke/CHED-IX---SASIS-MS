<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create mer4_submissions table (main table)
        Schema::create('mer4_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year');
            $table->enum('status', ['pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled', 'overwritten'])->default('pending');
            
            // Notes
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
            
            // Ensure one submission per year per HEI (excluding overwritten)
            $table->index(['hei_id', 'academic_year', 'status']);
        });

        // Create mer4_sas_management_items table (fixed rows - SAS Management and Administration)
        Schema::create('mer4_sas_management_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer4_submission_id');
            
            // Row identifier (matches fixedRows id from config)
            $table->string('row_id'); // e.g., 'sas_admin_1', 'sas_admin_2'
            
            // Fixed requirement text (stored for reference)
            $table->text('requirement');
            
            // Editable fields
            $table->text('evidence_file')->nullable(); // JSON: {name, size, type, data}
            $table->boolean('status_compiled')->default(false);
            $table->text('hei_remarks')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer4_submission_id')->references('id')->on('mer4_submissions')->onDelete('cascade');
            
            // Index for faster queries
            $table->index('mer4_submission_id');
            
            // Unique row per submission
            $table->unique(['mer4_submission_id', 'row_id']);
        });

        // Create mer4_guidance_counseling_items table (fixed rows - Guidance and Counseling Office)
        Schema::create('mer4_guidance_counseling_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer4_submission_id');
            
            // Row identifier (matches fixedRows id from config)
            $table->string('row_id'); // e.g., 'guidance_1', 'guidance_2'
            
            // Fixed requirement text (stored for reference)
            $table->text('requirement');
            
            // Editable fields
            $table->text('evidence_file')->nullable(); // JSON: {name, size, type, data}
            $table->boolean('status_compiled')->default(false);
            $table->text('hei_remarks')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer4_submission_id')->references('id')->on('mer4_submissions')->onDelete('cascade');
            
            // Index for faster queries
            $table->index('mer4_submission_id');
            
            // Unique row per submission
            $table->unique(['mer4_submission_id', 'row_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mer4_guidance_counseling_items');
        Schema::dropIfExists('mer4_sas_management_items');
        Schema::dropIfExists('mer4_submissions');
    }
};
