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
        'Application Assistance and Enrollment Guidance',
        'Entrance Examination Administration',
        'Scholarship and Financial Aid Information Desk',
        'PWD and Special Needs Accommodation Services',
        'Student Transfer and Cross-Enrollment Processing',
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexHBatch::class, 'batch_id', 'batch_id');
    }
}
