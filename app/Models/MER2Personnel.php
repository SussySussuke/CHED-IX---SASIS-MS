<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER2Personnel extends Model
{
    protected $table = 'mer2_personnel';

    protected $fillable = [
        'mer2_submission_id',
        'office_type',
        'name_of_personnel',
        'position_designation',
        'tenure_nature_of_appointment',
        'years_in_office',
        'qualification_highest_degree',
        'license_no_type',
        'license_expiry_date',
    ];

    protected $casts = [
        'years_in_office' => 'integer',
        'license_expiry_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========================================
    // CONSTANTS
    // ========================================

    const OFFICE_STUDENT_AFFAIRS = 'office_student_affairs';
    const GUIDANCE_OFFICE = 'guidance_office';
    const CAREER_DEV_CENTER = 'career_dev_center';
    const STUDENT_DEV_WELFARE = 'student_dev_welfare';

    /**
     * Get all valid office types
     */
    public static function getOfficeTypes()
    {
        return [
            self::OFFICE_STUDENT_AFFAIRS,
            self::GUIDANCE_OFFICE,
            self::CAREER_DEV_CENTER,
            self::STUDENT_DEV_WELFARE,
        ];
    }

    /**
     * Get human-readable office type names
     */
    public static function getOfficeTypeLabels()
    {
        return [
            self::OFFICE_STUDENT_AFFAIRS => 'Office of Student Affairs',
            self::GUIDANCE_OFFICE => 'Guidance Office',
            self::CAREER_DEV_CENTER => 'Career Development Center',
            self::STUDENT_DEV_WELFARE => 'Student Development and Welfare Office',
        ];
    }

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the submission that owns this personnel record
     */
    public function submission()
    {
        return $this->belongsTo(MER2Submission::class, 'mer2_submission_id');
    }

    // ========================================
    // ACCESSORS
    // ========================================

    /**
     * Get human-readable office type label
     */
    public function getOfficeTypeLabelAttribute()
    {
        $labels = self::getOfficeTypeLabels();
        return $labels[$this->office_type] ?? $this->office_type;
    }

    /**
     * Check if this personnel record has any data filled
     */
    public function getIsFilledAttribute()
    {
        return !empty($this->name_of_personnel) 
            || !empty($this->position_designation)
            || !empty($this->tenure_nature_of_appointment)
            || !empty($this->years_in_office)
            || !empty($this->qualification_highest_degree)
            || !empty($this->license_no_type)
            || !empty($this->license_expiry_date);
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope to filter by office type
     */
    public function scopeForOffice($query, $officeType)
    {
        return $query->where('office_type', $officeType);
    }

    /**
     * Scope to filter by submission
     */
    public function scopeForSubmission($query, $submissionId)
    {
        return $query->where('mer2_submission_id', $submissionId);
    }

    /**
     * Scope to get only filled personnel records
     * (at least one field has data)
     */
    public function scopeFilled($query)
    {
        return $query->where(function($q) {
            $q->whereNotNull('name_of_personnel')
              ->orWhereNotNull('position_designation')
              ->orWhereNotNull('tenure_nature_of_appointment')
              ->orWhereNotNull('years_in_office')
              ->orWhereNotNull('qualification_highest_degree')
              ->orWhereNotNull('license_no_type')
              ->orWhereNotNull('license_expiry_date');
        });
    }

    /**
     * Scope for Office of Student Affairs
     */
    public function scopeOfficeStudentAffairs($query)
    {
        return $query->where('office_type', self::OFFICE_STUDENT_AFFAIRS);
    }

    /**
     * Scope for Guidance Office
     */
    public function scopeGuidanceOffice($query)
    {
        return $query->where('office_type', self::GUIDANCE_OFFICE);
    }

    /**
     * Scope for Career Development Center
     */
    public function scopeCareerDevCenter($query)
    {
        return $query->where('office_type', self::CAREER_DEV_CENTER);
    }

    /**
     * Scope for Student Development and Welfare Office
     */
    public function scopeStudentDevWelfare($query)
    {
        return $query->where('office_type', self::STUDENT_DEV_WELFARE);
    }
}
