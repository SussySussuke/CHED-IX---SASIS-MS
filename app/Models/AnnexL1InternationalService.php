<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexL1InternationalService extends Model
{
    use HasFactory;

    protected $table = 'annex_l1_international_services';

    protected $fillable = [
        'batch_id',
        'service_name',
        'service_type',
        'target_nationality',
        'number_of_students_served',
        'officer_in_charge',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexL1Batch::class, 'batch_id', 'batch_id');
    }
}
