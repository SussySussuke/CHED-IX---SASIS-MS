<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexIScholarship extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'scholarship_name',
        'type',
        'category_intended_beneficiaries',
        'number_of_beneficiaries',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexIBatch::class, 'batch_id', 'batch_id');
    }
}
