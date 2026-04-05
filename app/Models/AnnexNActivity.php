<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexNActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'title_of_activity',
        'implementation_date',
        'implementation_venue',
        'participants_online',
        'participants_face_to_face',
        'organizer',
        'remarks',
    ];

    protected $casts = [
        'implementation_date' => 'date',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexNBatch::class, 'batch_id', 'batch_id');
    }
}
