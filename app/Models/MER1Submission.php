<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER1Submission extends Model
{
    protected $table = 'mer1_submissions';

    protected $fillable = [
        'hei_id',
        'academic_year',
        'status',
        'hei_name',
        'hei_code',
        'hei_type',
        'hei_address',
        'sas_head_name',
        'sas_head_position',
        'permanent_status',
        'other_achievements',
        'request_notes',
        'cancelled_notes',
        'admin_notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    public function educationalAttainments()
    {
        return $this->hasMany(MER1EducationalAttainment::class, 'mer1_submission_id');
    }

    public function trainings()
    {
        return $this->hasMany(MER1Training::class, 'mer1_submission_id');
    }

    // Accessors
    public function getEducationalAttainmentsCountAttribute()
    {
        return $this->educationalAttainments()->count();
    }

    public function getTrainingsCountAttribute()
    {
        return $this->trainings()->count();
    }

    // Scopes
    public function scopeForHei($query, $heiId)
    {
        return $query->where('hei_id', $heiId);
    }

    public function scopeForYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['approved', 'published']);
    }
}
