<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing single-string values into JSON arrays first
        DB::table('program_category_overrides')->get()->each(function ($row) {
            if ($row->manual_category !== null) {
                DB::table('program_category_overrides')
                    ->where('id', $row->id)
                    ->update(['manual_category' => json_encode([$row->manual_category])]);
            }
        });

        Schema::table('program_category_overrides', function (Blueprint $table) {
            // Rename column to plural; keep nullable for "reset" semantics
            $table->renameColumn('manual_category', 'manual_categories');
        });
    }

    public function down(): void
    {
        // Best-effort rollback: take first element of the JSON array
        Schema::table('program_category_overrides', function (Blueprint $table) {
            $table->renameColumn('manual_categories', 'manual_category');
        });

        DB::table('program_category_overrides')->get()->each(function ($row) {
            $decoded = json_decode($row->manual_category, true);
            $single  = is_array($decoded) ? ($decoded[0] ?? null) : null;
            DB::table('program_category_overrides')
                ->where('id', $row->id)
                ->update(['manual_category' => $single]);
        });
    }
};
