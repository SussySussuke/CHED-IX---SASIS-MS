<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hei_reference', function (Blueprint $table) {
            $table->id();
            $table->string('uii', 20)->nullable()->index();
            $table->string('name');
            $table->string('type', 20)->nullable();
            $table->string('street')->nullable();
            $table->string('barangay')->nullable();
            $table->string('municipality')->nullable();
            $table->string('province')->nullable();
            $table->string('region', 10)->nullable();
            $table->string('zip', 10)->nullable();
            $table->text('telephone')->nullable();
            $table->text('email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hei_reference');
    }
};
