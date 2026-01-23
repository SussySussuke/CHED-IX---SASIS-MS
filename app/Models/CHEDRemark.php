<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CHEDRemark extends Model
{
    protected $table = 'ched_remarks';

    protected $fillable = [
        'annex_type',
        'row_id',
        'batch_id',
        'hei_id',
        'academic_year',
        'is_best_practice',
        'admin_notes',
        'remarked_by',
        'remarked_at',
        'is_archived',
    ];

    protected $casts = [
        'is_best_practice' => 'boolean',
        'is_archived' => 'boolean',
        'remarked_at' => 'datetime',
    ];

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    public function remarkedBy()
    {
        return $this->belongsTo(User::class, 'remarked_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    public function scopeForHEI($query, $heiId, $academicYear = null)
    {
        $query->where('hei_id', $heiId);

        if ($academicYear) {
            $query->where('academic_year', $academicYear);
        }

        return $query;
    }

    public function scopeForBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    public function scopeForAnnex($query, $annexType)
    {
        return $query->where('annex_type', $annexType);
    }

    public function scopeForRow($query, $annexType, $rowId)
    {
        return $query->where('annex_type', $annexType)
                     ->where('row_id', $rowId);
    }

    // Helper methods
    public function archive()
    {
        $this->update(['is_archived' => true]);
    }

    public function toggle()
    {
        $this->update(['is_best_practice' => !$this->is_best_practice]);
    }

    public static function getRemarkForRow($annexType, $rowId)
    {
        return self::active()
            ->forRow($annexType, $rowId)
            ->first();
    }

    public static function setRemarkForRow($annexType, $rowId, $batchId, $heiId, $academicYear, $isBestPractice, $adminId)
    {
        return self::updateOrCreate(
            [
                'annex_type' => $annexType,
                'row_id' => $rowId,
                'batch_id' => $batchId,
                'is_archived' => false,
            ],
            [
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
                'is_best_practice' => $isBestPractice,
                'remarked_by' => $adminId,
                'remarked_at' => now(),
            ]
        );
    }

    public static function archiveBatchRemarks($batchId)
    {
        return self::where('batch_id', $batchId)
            ->where('is_archived', false)
            ->update(['is_archived' => true]);
    }

    public static function getRemarksSummary($heiId, $academicYear)
    {
        $remarks = self::active()
            ->forHEI($heiId, $academicYear)
            ->get();

        return [
            'total' => $remarks->count(),
            'best_practices' => $remarks->where('is_best_practice', true)->count(),
            'needs_improvement' => $remarks->where('is_best_practice', false)->count(),
            'by_annex' => $remarks->groupBy('annex_type')->map(function ($group) {
                return [
                    'total' => $group->count(),
                    'best_practices' => $group->where('is_best_practice', true)->count(),
                ];
            }),
        ];
    }
}
