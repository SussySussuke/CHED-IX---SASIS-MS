<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexDSubmission extends Model
{
    protected $table = 'annex_d_submissions';

    protected $fillable = [
        'submission_id',
        'hei_id',
        'academic_year',
        'status',
        'version_publication_date',
        'officer_in_charge',
        'handbook_committee',
        'dissemination_orientation',
        'orientation_dates',
        'mode_of_delivery',
        'dissemination_uploaded',
        'dissemination_others',
        'dissemination_others_text',
        'type_digital',
        'type_printed',
        'type_others',
        'type_others_text',
        'has_academic_policies',
        'has_admission_requirements',
        'has_code_of_conduct',
        'has_scholarships',
        'has_student_publication',
        'has_housing_services',
        'has_disability_services',
        'has_student_council',
        'has_refund_policies',
        'has_drug_education',
        'has_foreign_students',
        'has_disaster_management',
        'has_safe_spaces',
        'has_anti_hazing',
        'has_anti_bullying',
        'has_violence_against_women',
        'has_gender_fair',
        'has_others',
        'has_others_text',
        'request_notes',
        'cancelled_notes',
    ];

    protected $casts = [
        'dissemination_orientation' => 'boolean',
        'dissemination_uploaded' => 'boolean',
        'dissemination_others' => 'boolean',
        'type_digital' => 'boolean',
        'type_printed' => 'boolean',
        'type_others' => 'boolean',
        'has_academic_policies' => 'boolean',
        'has_admission_requirements' => 'boolean',
        'has_code_of_conduct' => 'boolean',
        'has_scholarships' => 'boolean',
        'has_student_publication' => 'boolean',
        'has_housing_services' => 'boolean',
        'has_disability_services' => 'boolean',
        'has_student_council' => 'boolean',
        'has_refund_policies' => 'boolean',
        'has_drug_education' => 'boolean',
        'has_foreign_students' => 'boolean',
        'has_disaster_management' => 'boolean',
        'has_safe_spaces' => 'boolean',
        'has_anti_hazing' => 'boolean',
        'has_anti_bullying' => 'boolean',
        'has_violence_against_women' => 'boolean',
        'has_gender_fair' => 'boolean',
        'has_others' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->submission_id)) {
                $model->submission_id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }
}
