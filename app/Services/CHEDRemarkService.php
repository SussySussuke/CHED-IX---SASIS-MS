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
    public function setRemark($annexType, $rowId, $batchId, $heiId, $academicYear, $remarkText, $adminNotes = null)
    {
        $adminId = Auth::id();

        $remark = CHEDRemark::setRemarkForRow(
            $annexType,
            $rowId,
            $batchId,
            $heiId,
            $academicYear,
            $remarkText,
            $adminId
        );

        if ($adminNotes) {
            $remark->update(['admin_notes' => $adminNotes]);
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
                $remarkData['remark_text'] ?? null,
                $remarkData['admin_notes'] ?? null
            );

            $results[] = $remark;
        }

        return $results;
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
                'remark_text' => $remark->remark_text,
                'admin_notes' => $remark->admin_notes,
                'remarked_by' => $remark->remarkedBy->name,
                'remarked_at' => $remark->remarked_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }
}
