<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('summary', function (Blueprint $table) {
            // Widen from string(10) (stored 'yes'/'no') to string(2048) for Google Drive URLs.
            // Existing rows with 'yes'/'no' become stale data — acceptable; they will be
            // re-submitted by HEIs with valid URLs going forward.
            $table->string('submitted_org_chart', 2048)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('summary', function (Blueprint $table) {
            $table->string('submitted_org_chart', 10)->nullable()->change();
        });
    }
};
