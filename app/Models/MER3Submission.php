<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER3Submission extends Model
{
    protected $table = 'mer3_submissions';

    protected $fillable = [
        'hei_id',
        'academic_year',
        'status',
        'request_notes',
        'cancelled_notes',
        'admin_notes',
    ];

    protected $casts = [
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
     * Get all school fees for this submission
     */
    public function schoolFees()
    {
        return $this->hasMany(MER3SchoolFee::class, 'mer3_submission_id');
    }

    // ========================================
    // ACCESSORS
    // ========================================

    /**
     * Get total count of school fees entries
     */
    public function getTotalSchoolFeesCountAttribute()
    {
        return $this->schoolFees()->count();
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
