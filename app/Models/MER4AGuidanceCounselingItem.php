<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER4AGuidanceCounselingItem extends Model
{
    protected $table = 'mer4a_guidance_counseling_items';

    protected $fillable = [
        'mer4a_submission_id',
        'row_id',
        'requirement',
        'evidence_file',
        'status_compiled',
        'hei_remarks',
    ];

    protected $casts = [
        'status_compiled' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function submission()
    {
        return $this->belongsTo(MER4ASubmission::class, 'mer4a_submission_id');
    }
}
