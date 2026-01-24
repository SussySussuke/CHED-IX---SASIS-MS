<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CHEDContact extends Model
{
    protected $table = 'ched_contacts';

    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'order',
        'is_active',
    ];

    /**
     * Get all active contacts ordered by display order
     */
    public static function getActive()
    {
        return self::where('is_active', true)
                   ->orderBy('order', 'asc')
                   ->get();
    }
}
