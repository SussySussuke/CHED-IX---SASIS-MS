<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexJProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'title_of_program',
        'organizer',
        'participants_online',
        'participants_face_to_face',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexJBatch::class, 'batch_id', 'batch_id');
    }
}
