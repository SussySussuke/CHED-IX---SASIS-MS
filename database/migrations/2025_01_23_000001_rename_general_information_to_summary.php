<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

// THIS MIGRATION IS A NO-OP.
// Originally renamed 'general_information' -> 'summary'.
// The base migration (0001_01_01_000000_create_base_tables.php) now creates
// the 'summary' table directly, so this rename is obsolete.
// Kept in history to preserve migration order integrity.

return new class extends Migration
{
    public function up(): void
    {
        // no-op: table already created as 'summary' in base migration
    }

    public function down(): void
    {
        // no-op
    }
};
