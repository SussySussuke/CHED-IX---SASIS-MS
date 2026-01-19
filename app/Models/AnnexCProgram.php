<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnnexCProgram extends Model
{
    protected $table = 'annex_c_programs';

    protected $fillable = [
        'batch_id',
        'title',
        'venue',
        'implementation_date',
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
        return $this->belongsTo(AnnexCBatch::class, 'batch_id', 'batch_id');
    }
}
