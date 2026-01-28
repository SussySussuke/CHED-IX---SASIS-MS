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
        // Create annex_c1_batches table
        Schema::create('annex_c1_batches', function (Blueprint $table) {
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

        // Create annex_c1_programs table
        Schema::create('annex_c1_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title');
            $table->string('venue');
            $table->date('implementation_date');
            $table->string('target_group');
            $table->integer('participants_online')->default(0);
            $table->integer('participants_face_to_face')->default(0);
            $table->string('organizer');
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('batch_id')->references('batch_id')->on('annex_c1_batches')->onDelete('cascade');

            // Index for faster queries
            $table->index('batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annex_c1_programs');
        Schema::dropIfExists('annex_c1_batches');
    }
};
