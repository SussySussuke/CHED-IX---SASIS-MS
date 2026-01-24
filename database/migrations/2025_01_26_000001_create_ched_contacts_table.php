<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ched_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default contact
        DB::table('ched_contacts')->insert([
            'name' => 'CHED Central Office',
            'address' => 'Higher Education Development Center Building, C.P. Garcia Ave., U.P. Campus, Diliman, Quezon City',
            'phone' => '(02) 8441-1143',
            'email' => 'ched@ched.gov.ph',
            'order' => 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ched_contacts');
    }
};
