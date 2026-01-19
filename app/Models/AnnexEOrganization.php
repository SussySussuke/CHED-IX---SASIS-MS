<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnexEOrganization extends Model
{
    protected $table = 'annex_e_organizations';

    protected $fillable = [
        'batch_id',
        'name_of_accredited',
        'years_of_existence',
        'accredited_since',
        'faculty_adviser',
        'president_and_officers',
        'specialization',
        'fee_collected',
        'programs_projects_activities',
    ];

    protected $casts = [
        'years_of_existence' => 'integer',
    ];

    // Relationships
    public function batch()
    {
        return $this->belongsTo(AnnexEBatch::class, 'batch_id', 'batch_id');
    }
}
