<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Split annex_j_programs.number_of_participants into
 * participants_online + participants_face_to_face.
 *
 * Since the old column stored only a summed total (the controller was adding
 * them together before saving), the split cannot be recovered.
 * Both new columns start at 0 for existing rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annex_j_programs', function (Blueprint $table) {
            $table->unsignedInteger('participants_online')->default(0)->after('organizer');
            $table->unsignedInteger('participants_face_to_face')->default(0)->after('participants_online');
        });

        Schema::table('annex_j_programs', function (Blueprint $table) {
            $table->dropColumn('number_of_participants');
        });
    }

    public function down(): void
    {
        Schema::table('annex_j_programs', function (Blueprint $table) {
            $table->integer('number_of_participants')->nullable()->default(0)->after('organizer');
        });

        Schema::table('annex_j_programs', function (Blueprint $table) {
            $table->dropColumn('participants_online');
            $table->dropColumn('participants_face_to_face');
        });
    }
};
