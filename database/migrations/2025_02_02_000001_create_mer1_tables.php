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
        // Create mer1_submissions table (main table)
        Schema::create('mer1_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year');
            $table->enum('status', ['pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled'])->default('pending');
            
            // Form Fields - SAS Head Information
            $table->string('sas_head_name');
            $table->string('sas_head_position');
            $table->string('permanent_status')->nullable();
            $table->text('other_achievements')->nullable();
            
            // Notes
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->text('admin_notes')->nullable();
            
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
            
            // Ensure one submission per year per HEI
            $table->unique(['hei_id', 'academic_year']);
            
            // Index for faster queries
            $table->index(['hei_id', 'academic_year', 'status']);
        });

        // Create mer1_educational_attainments table (one-to-many)
        Schema::create('mer1_educational_attainments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer1_submission_id');
            $table->string('degree_program');
            $table->string('school');
            $table->string('year')->nullable();
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer1_submission_id')->references('id')->on('mer1_submissions')->onDelete('cascade');
            
            // Index for faster queries
            $table->index('mer1_submission_id');
        });

        // Create mer1_trainings table (one-to-many)
        Schema::create('mer1_trainings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mer1_submission_id');
            $table->string('training_title');
            $table->string('period_date');
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('mer1_submission_id')->references('id')->on('mer1_submissions')->onDelete('cascade');
            
            // Index for faster queries
            $table->index('mer1_submission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mer1_trainings');
        Schema::dropIfExists('mer1_educational_attainments');
        Schema::dropIfExists('mer1_submissions');
    }
};
