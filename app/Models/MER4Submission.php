<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MER4Submission extends Model
{
    protected $table = 'mer4_submissions';

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

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    public function sasManagementItems()
    {
        return $this->hasMany(MER4SASManagementItem::class, 'mer4_submission_id');
    }

    public function guidanceCounselingItems()
    {
        return $this->hasMany(MER4GuidanceCounselingItem::class, 'mer4_submission_id');
    }

    // Accessors
    public function getSasManagementItemsCountAttribute()
    {
        return $this->sasManagementItems()->count();
    }

    public function getGuidanceCounselingItemsCountAttribute()
    {
        return $this->guidanceCounselingItems()->count();
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
    
    public function scopeNotOverwritten($query)
    {
        return $query->where('status', '!=', 'overwritten');
    }
}
