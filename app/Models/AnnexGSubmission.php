<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexGSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'hei_id',
        'academic_year',
        'status',
        'official_school_name',
        'student_publication_name',
        'publication_fee_per_student',
        'frequency_monthly',
        'frequency_quarterly',
        'frequency_annual',
        'frequency_per_semester',
        'frequency_others',
        'frequency_others_specify',
        'publication_type_newsletter',
        'publication_type_gazette',
        'publication_type_magazine',
        'publication_type_others',
        'publication_type_others_specify',
        'adviser_name',
        'adviser_position_designation',
        'request_notes',
        'cancelled_notes',
    ];

    protected $casts = [
        'frequency_monthly' => 'boolean',
        'frequency_quarterly' => 'boolean',
        'frequency_annual' => 'boolean',
        'frequency_per_semester' => 'boolean',
        'frequency_others' => 'boolean',
        'publication_type_newsletter' => 'boolean',
        'publication_type_gazette' => 'boolean',
        'publication_type_magazine' => 'boolean',
        'publication_type_others' => 'boolean',
        'publication_fee_per_student' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->submission_id) {
                $model->submission_id = (string) Str::uuid();
            }
        });
    }

    public function editorialBoards()
    {
        return $this->hasMany(AnnexGEditorialBoard::class, 'submission_id', 'submission_id');
    }

    public function otherPublications()
    {
        return $this->hasMany(AnnexGOtherPublication::class, 'submission_id', 'submission_id');
    }

    public function programs()
    {
        return $this->hasMany(AnnexGProgram::class, 'submission_id', 'submission_id');
    }

    public function hei()
    {
        return $this->belongsTo(Hei::class);
    }
}
