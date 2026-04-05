<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Split annex_n_activities.number_of_participants into
 * participants_online + participants_face_to_face.
 *
 * Same situation as Annex J (fixed in 2026_03_25_000001).
 * The old column stored only a summed total — the controller was summing
 * participants_online + participants_face_to_face before saving.
 * The split cannot be recovered; both new columns default to 0 for existing rows.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annex_n_activities', function (Blueprint $table) {
            $table->unsignedInteger('participants_online')->default(0)->after('implementation_venue');
            $table->unsignedInteger('participants_face_to_face')->default(0)->after('participants_online');
        });

        Schema::table('annex_n_activities', function (Blueprint $table) {
            $table->dropColumn('number_of_participants');
        });
    }

    public function down(): void
    {
        Schema::table('annex_n_activities', function (Blueprint $table) {
            $table->integer('number_of_participants')->nullable()->default(0)->after('implementation_venue');
        });

        Schema::table('annex_n_activities', function (Blueprint $table) {
            $table->dropColumn('participants_online');
            $table->dropColumn('participants_face_to_face');
        });
    }
};
