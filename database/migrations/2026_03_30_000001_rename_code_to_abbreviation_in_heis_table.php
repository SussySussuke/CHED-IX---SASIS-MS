<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('heis', function (Blueprint $table) {
            $table->renameColumn('code', 'abbreviation');
        });
    }

    public function down(): void
    {
        Schema::table('heis', function (Blueprint $table) {
            $table->renameColumn('abbreviation', 'code');
        });
    }
};
