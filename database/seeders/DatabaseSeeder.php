<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::create([
            'name'         => 'Super Admin',
            'email'        => 'superadmin@ched.gov.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'superadmin',
            'is_active'    => true,
        ]);
    }
}
