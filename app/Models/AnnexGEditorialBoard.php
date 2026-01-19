<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexGEditorialBoard extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'name',
        'position_in_editorial_board',
        'degree_program_year_level',
    ];

    public function submission()
    {
        return $this->belongsTo(AnnexGSubmission::class, 'submission_id', 'submission_id');
    }
}
