<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add 'system' to user_role enum and make user_id nullable.
     * Required to support audit log entries created by artisan commands (no authenticated user).
     */
    public function up(): void
    {
        // Make user_id nullable first (FK constraint must be dropped on MySQL to alter)
        DB::statement('ALTER TABLE audit_logs MODIFY user_id BIGINT UNSIGNED NULL');

        // Expand enum to include 'system'
        DB::statement("ALTER TABLE audit_logs MODIFY user_role ENUM('superadmin', 'admin', 'system') NOT NULL");
    }

    public function down(): void
    {
        // Remove system rows before reverting enum (avoids constraint error)
        DB::statement("DELETE FROM audit_logs WHERE user_role = 'system'");

        DB::statement("ALTER TABLE audit_logs MODIFY user_role ENUM('superadmin', 'admin') NOT NULL");
        DB::statement('ALTER TABLE audit_logs MODIFY user_id BIGINT UNSIGNED NOT NULL');
    }
};
