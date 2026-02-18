<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramCategoryOverride extends Model
{
    protected $table = 'program_category_overrides';

    protected $fillable = [
        'program_type',
        'program_id',
        'manual_categories',
        'overridden_by',
        'overridden_at',
    ];

    protected $casts = [
        'program_id'         => 'integer',
        'manual_categories'  => 'array',
        'overridden_by'      => 'integer',
        'overridden_at'      => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'overridden_by');
    }
}
