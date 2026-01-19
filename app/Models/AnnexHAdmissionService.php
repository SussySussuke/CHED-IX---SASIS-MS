<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexHAdmissionService extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'service_type',
        'with',
        'supporting_documents',
        'remarks',
    ];

    protected $casts = [
        'with' => 'boolean',
    ];

    const PREDEFINED_SERVICES = [
        'General admission guidelines',
        'Admission guidelines including accepting persons with disabilities',
        'Admission guidelines accepting foreign students (if applicable)',
        'Drug testing',
        'Medical Certificate',
        'Online enrolment and payment system',
        'Entrance examination',
        'Assessment',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexHBatch::class, 'batch_id', 'batch_id');
    }
}
