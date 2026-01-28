<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnexC1Program extends Model
{
    protected $table = 'annex_c1_programs';

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
        return $this->belongsTo(AnnexC1Batch::class, 'batch_id', 'batch_id');
    }
}
