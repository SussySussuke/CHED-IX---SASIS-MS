<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuidanceCounsellingCategoryOverride extends Model
{
    protected $table = 'guidance_counselling_category_overrides';

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
        return $this->belongsTo(AnnexBProgram::class, 'program_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'overridden_by');
    }
}
