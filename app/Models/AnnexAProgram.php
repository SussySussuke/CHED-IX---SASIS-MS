<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnexAProgram extends Model
{
    protected $table = 'annex_a_programs';

    protected $fillable = [
        'batch_id',
        'title',
        'venue',
        'implementation_date',
        'target_group',
        'participants_online',
        'participants_face_to_face',
        'organizer',
        'remarks',
    ];

    protected $casts = [
        'participants_online' => 'integer',
        'participants_face_to_face' => 'integer',
        'implementation_date' => 'date',
    ];

    // Relationships
    public function batch()
    {
        return $this->belongsTo(AnnexABatch::class, 'batch_id', 'batch_id');
    }
}
