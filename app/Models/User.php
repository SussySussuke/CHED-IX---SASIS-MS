<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'account_type',
        'hei_id',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    // Helper methods
    public function isSuperAdmin(): bool
    {
        return $this->account_type === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return $this->account_type === 'admin';
    }

    public function isHEI(): bool
    {
        return $this->account_type === 'hei';
    }
}
