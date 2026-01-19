<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexLHousing extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'housing_name',
        'complete_address',
        'house_manager_name',
        'male',
        'female',
        'coed',
        'others',
        'remarks',
    ];

    protected $casts = [
        'male' => 'boolean',
        'female' => 'boolean',
        'coed' => 'boolean',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexLBatch::class, 'batch_id', 'batch_id');
    }
}
