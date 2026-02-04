<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER3SchoolFee extends Model
{
    protected $table = 'mer3_school_fees';

    protected $fillable = [
        'mer3_submission_id',
        'name_of_school_fees',
        'description',
        'amount',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ========================================
    // RELATIONSHIPS
    // ========================================

    /**
     * Get the submission that owns this school fee record
     */
    public function submission()
    {
        return $this->belongsTo(MER3Submission::class, 'mer3_submission_id');
    }

    // ========================================
    // ACCESSORS
    // ========================================

    /**
     * Check if this school fee record has any data filled
     */
    public function getIsFilledAttribute()
    {
        return !empty($this->name_of_school_fees) 
            || !empty($this->description)
            || !empty($this->amount)
            || !empty($this->remarks);
    }

    // ========================================
    // SCOPES
    // ========================================

    /**
     * Scope to filter by submission
     */
    public function scopeForSubmission($query, $submissionId)
    {
        return $query->where('mer3_submission_id', $submissionId);
    }

    /**
     * Scope to get only filled school fee records
     * (at least one field has data)
     */
    public function scopeFilled($query)
    {
        return $query->where(function($q) {
            $q->whereNotNull('name_of_school_fees')
              ->orWhereNotNull('description')
              ->orWhereNotNull('amount')
              ->orWhereNotNull('remarks');
        });
    }
}
