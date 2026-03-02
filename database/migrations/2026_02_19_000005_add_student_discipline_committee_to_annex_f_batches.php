<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annex_f_batches', function (Blueprint $table) {
            $table->string('student_discipline_committee', 255)->nullable()->after('complaint_desk');
        });
    }

    public function down(): void
    {
        Schema::table('annex_f_batches', function (Blueprint $table) {
            $table->dropColumn('student_discipline_committee');
        });
    }
};
