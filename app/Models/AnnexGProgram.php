<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexGProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'title_of_program',
        'implementation_date',
        'implementation_venue',
        'target_group_of_participants',
    ];

    public function submission()
    {
        return $this->belongsTo(AnnexGSubmission::class, 'submission_id', 'submission_id');
    }
}
