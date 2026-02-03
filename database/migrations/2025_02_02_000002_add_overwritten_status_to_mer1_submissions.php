<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE mer1_submissions MODIFY status ENUM('pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled', 'overwritten') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE mer1_submissions MODIFY status ENUM('pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled') DEFAULT 'pending'");
    }
};
