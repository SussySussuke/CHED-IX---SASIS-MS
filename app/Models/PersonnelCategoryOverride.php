<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonnelCategoryOverride extends Model
{
    protected $table = 'personnel_category_overrides';

    protected $fillable = [
        'personnel_id',
        'manual_categories',
        'overridden_by',
        'overridden_at',
    ];

    protected $casts = [
        'personnel_id'      => 'integer',
        'manual_categories' => 'array',
        'overridden_by'     => 'integer',
        'overridden_at'     => 'datetime',
    ];

    public function personnel()
    {
        return $this->belongsTo(MER2Personnel::class, 'personnel_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'overridden_by');
    }
}
