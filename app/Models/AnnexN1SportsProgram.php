<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexN1SportsProgram extends Model
{
    use HasFactory;

    protected $table = 'annex_n1_sports_programs';

    protected $fillable = [
        'batch_id',
        'program_title',
        'sport_type',
        'implementation_date',
        'venue',
        'participants_count',
        'organizer',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexN1Batch::class, 'batch_id', 'batch_id');
    }
}
