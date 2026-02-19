<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerJobCategoryOverride extends Model
{
    protected $table = 'career_job_category_overrides';

    protected $fillable = [
        'program_id',
        'manual_categories',
        'overridden_by',
        'overridden_at',
    ];

    protected $casts = [
        'program_id'        => 'integer',
        'manual_categories' => 'array',
        'overridden_by'     => 'integer',
        'overridden_at'     => 'datetime',
    ];

    public function program()
    {
        return $this->belongsTo(AnnexCProgram::class, 'program_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'overridden_by');
    }
}
