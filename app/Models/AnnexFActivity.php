<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexFActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'activity',
        'date',
        'status',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexFBatch::class, 'batch_id', 'batch_id');
    }
}
