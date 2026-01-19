<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnexBProgram extends Model
{
    protected $table = 'annex_b_programs';

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
        return $this->belongsTo(AnnexBBatch::class, 'batch_id', 'batch_id');
    }
}
