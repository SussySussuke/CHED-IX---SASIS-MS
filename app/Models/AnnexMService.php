<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexMService extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'section',
        'category',
        'institutional_services_programs_activities',
        'number_of_beneficiaries_participants',
        'remarks',
        'display_order',
    ];

    protected $casts = [
        'number_of_beneficiaries_participants' => 'integer',
        'display_order' => 'integer',
    ];

    // Predefined sections for grouping services
    const SECTIONS = [
        'A. Persons with Disabilities',
        'B. Indigenous People',
        'C. Dependents of Solo Parents / Solo Parents',
        'D. Other students with special needs',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexMBatch::class, 'batch_id', 'batch_id');
    }
}
