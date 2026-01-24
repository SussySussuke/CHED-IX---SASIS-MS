<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('heis', function (Blueprint $table) {
            $table->date('established_at')->default('2000-01-01')->after('address');
        });

        // Set default value for existing records
        DB::table('heis')->update(['established_at' => '2000-01-01']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('heis', function (Blueprint $table) {
            $table->dropColumn('established_at');
        });
    }
};
