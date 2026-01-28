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
        // Create annex_n1_batches table
        Schema::create('annex_n1_batches', function (Blueprint $table) {
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

        // Create annex_n1_sports_programs table
        Schema::create('annex_n1_sports_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('program_title');
            $table->string('sport_type');
            $table->date('implementation_date');
            $table->string('venue');
            $table->integer('participants_count')->nullable()->default(0);
            $table->string('organizer');
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('batch_id')->references('batch_id')->on('annex_n1_batches')->onDelete('cascade');

            // Index for faster queries
            $table->index('batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annex_n1_sports_programs');
        Schema::dropIfExists('annex_n1_batches');
    }
};
