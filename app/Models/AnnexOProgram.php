<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexOProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'title_of_program',
        'date_conducted',
        'number_of_beneficiaries',
        'type_of_community_service',
        'community_population_served',
    ];

    protected $casts = [
        'date_conducted' => 'date',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexOBatch::class, 'batch_id', 'batch_id');
    }
}
