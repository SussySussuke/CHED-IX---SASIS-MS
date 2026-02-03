<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER1EducationalAttainment extends Model
{
    protected $table = 'mer1_educational_attainments';

    protected $fillable = [
        'mer1_submission_id',
        'degree_program',
        'school',
        'year',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function submission()
    {
        return $this->belongsTo(MER1Submission::class, 'mer1_submission_id');
    }
}
