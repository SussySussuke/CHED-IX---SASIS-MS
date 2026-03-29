<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace boolean is_best_practice with nullable string remark_text.
     * CHED remarks are now free-text (like HEI remarks) instead of a best-practice checkbox flag.
     */
    public function up(): void
    {
        Schema::table('ched_remarks', function (Blueprint $table) {
            $table->dropColumn('is_best_practice');
            $table->string('remark_text')->nullable()->after('academic_year');
        });
    }

    public function down(): void
    {
        Schema::table('ched_remarks', function (Blueprint $table) {
            $table->dropColumn('remark_text');
            $table->boolean('is_best_practice')->default(false)->after('academic_year');
        });
    }
};
