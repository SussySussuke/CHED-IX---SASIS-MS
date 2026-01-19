<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexHAdmissionStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'program',
        'applicants',
        'admitted',
        'enrolled',
    ];

    protected $casts = [
        'applicants' => 'integer',
        'admitted' => 'integer',
        'enrolled' => 'integer',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexHBatch::class, 'batch_id', 'batch_id');
    }
}
