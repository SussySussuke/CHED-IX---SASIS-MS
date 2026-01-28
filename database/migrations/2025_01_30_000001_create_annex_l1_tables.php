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
        // Create annex_l1_batches table
        Schema::create('annex_l1_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year');
            $table->enum('status', ['pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled'])->default('pending');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');

            // Index for faster queries
            $table->index(['hei_id', 'academic_year', 'status']);
        });

        // Create annex_l1_international_services table
        Schema::create('annex_l1_international_services', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('service_name');
            $table->string('service_type');
            $table->string('target_nationality');
            $table->integer('number_of_students_served')->nullable()->default(0);
            $table->string('officer_in_charge');
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('batch_id')->references('batch_id')->on('annex_l1_batches')->onDelete('cascade');

            // Index for faster queries
            $table->index('batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annex_l1_international_services');
        Schema::dropIfExists('annex_l1_batches');
    }
};
