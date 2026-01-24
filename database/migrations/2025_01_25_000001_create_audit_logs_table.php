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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // Who performed the action
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('user_name'); // Snapshot of name at time of action
            $table->enum('user_role', ['superadmin', 'admin']); // Role at time of action
            
            // What action was performed
            $table->string('action'); // created, updated, deleted, approved, rejected
            $table->string('entity_type'); // User, HEI, Submission, Setting, etc.
            $table->unsignedBigInteger('entity_id')->nullable(); // ID of affected entity
            $table->string('entity_name')->nullable(); // Name/description of affected entity
            
            // Details of the action
            $table->text('description'); // Human-readable description
            $table->json('old_values')->nullable(); // Before state (for updates/deletes)
            $table->json('new_values')->nullable(); // After state (for creates/updates)
            
            // Additional context
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at'); // When action occurred
            
            // Indexes for efficient querying
            $table->index('user_id');
            $table->index('entity_type');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
