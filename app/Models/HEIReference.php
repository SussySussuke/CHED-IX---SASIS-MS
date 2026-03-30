<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HEIReference extends Model
{
    protected $table = 'hei_reference';

    protected $fillable = [
        'uii', 'name', 'type', 'street', 'barangay',
        'municipality', 'province', 'region', 'zip',
        'telephone', 'email',
    ];
}
