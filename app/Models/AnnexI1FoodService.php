<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexI1FoodService extends Model
{
    use HasFactory;

    protected $table = 'annex_i1_food_services';

    protected $fillable = [
        'batch_id',
        'service_name',
        'service_type',
        'operator_name',
        'location',
        'number_of_students_served',
        'remarks',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexI1Batch::class, 'batch_id', 'batch_id');
    }
}
