<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER1Training extends Model
{
    protected $table = 'mer1_trainings';

    protected $fillable = [
        'mer1_submission_id',
        'training_title',
        'period_date',
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
