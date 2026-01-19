<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexKCommittee extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'committee_name',
        'committee_head_name',
        'members_composition',
        'programs_projects_activities_trainings',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexKBatch::class, 'batch_id', 'batch_id');
    }
}
