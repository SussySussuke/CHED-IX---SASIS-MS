<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Summary extends Model
{
    protected $table = 'summary';

    protected $fillable = [
        'hei_id',
        'academic_year',
        'population_male',
        'population_female',
        'population_intersex',
        'population_total',
        'submitted_org_chart',
        'hei_website',
        'sas_website',
        'social_media_contacts',
        'student_handbook',
        'student_publication',
        'status',
        'cancelled_notes',
        'request_notes'
    ];

    protected $casts = [
        'social_media_contacts' => 'array',
        'population_male' => 'integer',
        'population_female' => 'integer',
        'population_intersex' => 'integer',
        'population_total' => 'integer',
    ];

    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id', 'id');
    }
}
