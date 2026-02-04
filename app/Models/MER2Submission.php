<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER2Submission extends Model
{
    protected $table = 'mer2_submissions';

    protected $fillable = [
        'hei_id',
        'academic_year',
        'status',
        'office_student_affairs_students_handled',
        'guidance_office_students_handled',
        'career_dev_center_students_handled',
        'student_dev_welfare_students_handled',
        'request_notes',
        'cancelled_notes',
        'admin_notes',
    ];

    protected $casts = [
        'office_student_affairs_students_handled' => 'integer',
        'guidance_office_students_handled' => 'integer',
        'career_dev_center_students_handled' => 'integer',
        'student_dev_welfare_students_handled' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the HEI that owns this submission
     */
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    /**
     * Get all personnel records for this submission
     */
    public function personnel()
    {
        return $this->hasMany(MER2Personnel::class, 'mer2_submission_id');
    }

    /**
     * Get personnel for Office of Student Affairs
     */
    public function officeStudentAffairsPersonnel()
    {
        return $this->hasMany(MER2Personnel::class, 'mer2_submission_id')
                    ->where('office_type', 'office_student_affairs');
    }

    /**
     * Get personnel for Guidance Office
     */
    public function guidanceOfficePersonnel()
    {
        return $this->hasMany(MER2Personnel::class, 'mer2_submission_id')
                    ->where('office_type', 'guidance_office');
    }

    /**
     * Get personnel for Career Development Center
     */
    public function careerDevCenterPersonnel()
    {
        return $this->hasMany(MER2Personnel::class, 'mer2_submission_id')
                    ->where('office_type', 'career_dev_center');
    }

    /**
     * Get personnel for Student Development and Welfare Office
     */
    public function studentDevWelfarePersonnel()
    {
        return $this->hasMany(MER2Personnel::class, 'mer2_submission_id')
                    ->where('office_type', 'student_dev_welfare');
    }

    // ========================================
    // ACCESSORS
    // ========================================

    /**
     * Get total personnel count across all offices
     */
    public function getTotalPersonnelCountAttribute()
    {
        return $this->personnel()->count();
    }

    /**
     * Get personnel count for Office of Student Affairs
     */
    public function getOfficeStudentAffairsPersonnelCountAttribute()
    {
        return $this->officeStudentAffairsPersonnel()->count();
    }

    /**
     * Get personnel count for Guidance Office
     */
    public function getGuidanceOfficePersonnelCountAttribute()
    {
        return $this->guidanceOfficePersonnel()->count();
    }

    /**
     * Get personnel count for Career Development Center
     */
    public function getCareerDevCenterPersonnelCountAttribute()
    {
        return $this->careerDevCenterPersonnel()->count();
    }

    /**
     * Get personnel count for Student Development and Welfare Office
     */
    public function getStudentDevWelfarePersonnelCountAttribute()
    {
        return $this->studentDevWelfarePersonnel()->count();
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope to filter by HEI
     */
    public function scopeForHei($query, $heiId)
    {
        return $query->where('hei_id', $heiId);
    }

    /**
     * Scope to filter by academic year
     */
    public function scopeForYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    /**
     * Scope to get approved submissions
     */
    public function scopeApproved($query)
    {
        return $query->whereIn('status', ['approved', 'published']);
    }

    /**
     * Scope to get pending submissions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get submitted submissions
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }
}
