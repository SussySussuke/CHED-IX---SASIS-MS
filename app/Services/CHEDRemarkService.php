<?php

namespace App\Services;

use App\Models\CHEDRemark;
use Illuminate\Support\Facades\Auth;

class CHEDRemarkService
{
    /**
     * Get remark for a specific row
     */
    public function getRemark($annexType, $rowId)
    {
        return CHEDRemark::getRemarkForRow($annexType, $rowId);
    }

    /**
     * Set or update a remark for a specific row
     */
    public function setRemark($annexType, $rowId, $batchId, $heiId, $academicYear, $isBestPractice, $adminNotes = null)
    {
        $adminId = Auth::id();

        $remark = CHEDRemark::setRemarkForRow(
            $annexType,
            $rowId,
            $batchId,
            $heiId,
            $academicYear,
            $isBestPractice,
            $adminId
        );

        if ($adminNotes) {
            $remark->update(['admin_notes' => $adminNotes]);
        }

        return $remark;
    }

    /**
     * Toggle remark for a specific row
     */
    public function toggleRemark($annexType, $rowId, $batchId, $heiId, $academicYear)
    {
        $remark = CHEDRemark::getRemarkForRow($annexType, $rowId);

        if ($remark) {
            // Toggle existing remark
            $remark->toggle();
            $remark->update(['remarked_by' => Auth::id(), 'remarked_at' => now()]);
        } else {
            // Create new remark with default false, then toggle to true
            $remark = $this->setRemark($annexType, $rowId, $batchId, $heiId, $academicYear, true);
        }

        return $remark;
    }

    /**
     * Get all remarks for a specific HEI and academic year
     */
    public function getRemarksForHEI($heiId, $academicYear, $annexType = null)
    {
        $query = CHEDRemark::active()
            ->forHEI($heiId, $academicYear);

        if ($annexType) {
            $query->forAnnex($annexType);
        }

        return $query->get();
    }

    /**
     * Get all remarks for a specific batch
     */
    public function getRemarksForBatch($batchId)
    {
        return CHEDRemark::active()
            ->forBatch($batchId)
            ->get();
    }

    /**
     * Archive all remarks for a specific batch (used when batch is overwritten)
     */
    public function archiveBatchRemarks($batchId)
    {
        return CHEDRemark::archiveBatchRemarks($batchId);
    }

    /**
     * Get remarks summary for dashboard
     */
    public function getRemarksSummary($heiId, $academicYear)
    {
        return CHEDRemark::getRemarksSummary($heiId, $academicYear);
    }

    /**
     * Get remarks completion percentage for a form
     */
    public function getFormCompletionPercentage($heiId, $academicYear, $annexTypes)
    {
        $totalRows = 0;
        $remarkedRows = 0;

        foreach ($annexTypes as $annexType) {
            $remarks = $this->getRemarksForHEI($heiId, $academicYear, $annexType);
            $remarkedRows += $remarks->count();

            // Get total rows from form builder (this is an approximation)
            // In reality, we'd query the actual annex tables
            $totalRows += $this->getTotalRowsForAnnex($annexType, $heiId, $academicYear);
        }

        if ($totalRows === 0) {
            return 0;
        }

        return round(($remarkedRows / $totalRows) * 100, 2);
    }

    /**
     * Helper to get total rows for an annex
     * This queries the actual annex tables to count rows
     */
    private function getTotalRowsForAnnex($annexType, $heiId, $academicYear)
    {
        // Map annex type to model class
        $modelMap = [
            'annex_a' => \App\Models\AnnexABatch::class,
            'annex_b' => \App\Models\AnnexBBatch::class,
            'annex_c' => \App\Models\AnnexCBatch::class,
            'annex_d' => \App\Models\AnnexDSubmission::class,
            'annex_e' => \App\Models\AnnexEBatch::class,
            'annex_f' => \App\Models\AnnexFBatch::class,
            'annex_g' => \App\Models\AnnexGSubmission::class,
            'annex_h' => \App\Models\AnnexHBatch::class,
            'annex_i' => \App\Models\AnnexIBatch::class,
            'annex_j' => \App\Models\AnnexJBatch::class,
            'annex_k' => \App\Models\AnnexKBatch::class,
            'annex_l' => \App\Models\AnnexLBatch::class,
            'annex_m' => \App\Models\AnnexMBatch::class,
            'annex_n' => \App\Models\AnnexNBatch::class,
            'annex_o' => \App\Models\AnnexOBatch::class,
        ];

        $relationMap = [
            'annex_a' => 'programs',
            'annex_b' => 'courses',
            'annex_c' => 'courses',
            'annex_e' => 'partnerships',
            'annex_f' => 'activities',
            'annex_h' => 'admissions',
            'annex_i' => 'scholarships',
            'annex_j' => 'awards',
            'annex_k' => 'committees',
            'annex_l' => 'facilities',
            'annex_m' => 'services',
            'annex_n' => 'programs',
            'annex_o' => 'programs',
        ];

        if (!isset($modelMap[$annexType])) {
            return 0;
        }

        $modelClass = $modelMap[$annexType];
        $batch = $modelClass::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->where('status', 'submitted')
            ->latest()
            ->first();

        if (!$batch) {
            return 0;
        }

        // For submission types (D, G), count is 1
        if (in_array($annexType, ['annex_d', 'annex_g'])) {
            return 1;
        }

        // For batch types, count related records
        $relation = $relationMap[$annexType] ?? null;
        if ($relation && method_exists($batch, $relation)) {
            return $batch->$relation()->count();
        }

        return 0;
    }

    /**
     * Batch set remarks for multiple rows
     */
    public function batchSetRemarks($remarksData)
    {
        $results = [];

        foreach ($remarksData as $remarkData) {
            $remark = $this->setRemark(
                $remarkData['annex_type'],
                $remarkData['row_id'],
                $remarkData['batch_id'],
                $remarkData['hei_id'],
                $remarkData['academic_year'],
                $remarkData['is_best_practice'],
                $remarkData['admin_notes'] ?? null
            );

            $results[] = $remark;
        }

        return $results;
    }

    /**
     * Get all HEIs with incomplete remarks for a specific academic year
     */
    public function getHEIsWithIncompleteRemarks($academicYear)
    {
        // This would query all HEIs and check which ones have incomplete remarks
        // Implementation depends on specific business logic
        // For now, returning a placeholder
        return [];
    }

    /**
     * Export remarks to array format (for PDF/Excel generation)
     */
    public function exportRemarks($heiId, $academicYear, $annexTypes = null)
    {
        $query = CHEDRemark::active()
            ->with(['hei', 'remarkedBy'])
            ->forHEI($heiId, $academicYear);

        if ($annexTypes) {
            $query->whereIn('annex_type', $annexTypes);
        }

        return $query->get()->map(function ($remark) {
            return [
                'annex_type' => $remark->annex_type,
                'row_id' => $remark->row_id,
                'batch_id' => $remark->batch_id,
                'hei_name' => $remark->hei->name,
                'academic_year' => $remark->academic_year,
                'is_best_practice' => $remark->is_best_practice,
                'admin_notes' => $remark->admin_notes,
                'remarked_by' => $remark->remarkedBy->name,
                'remarked_at' => $remark->remarked_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }
}
