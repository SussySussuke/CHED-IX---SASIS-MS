<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CHEDRemarkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CHEDRemarkController extends Controller
{
    protected $remarkService;

    public function __construct(CHEDRemarkService $remarkService)
    {
        $this->remarkService = $remarkService;
    }

    /**
     * Toggle a CHED remark (auto-save on checkbox click)
     */
    public function toggle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'annex_type' => 'required|string',
            'row_id' => 'required|integer',
            'batch_id' => 'required|string',
            'hei_id' => 'required|integer',
            'academic_year' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $remark = $this->remarkService->toggleRemark(
            $request->annex_type,
            $request->row_id,
            $request->batch_id,
            $request->hei_id,
            $request->academic_year
        );

        return response()->json([
            'success' => true,
            'remark' => [
                'id' => $remark->id,
                'is_best_practice' => $remark->is_best_practice,
                'remarked_at' => $remark->remarked_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Set a specific remark value
     */
    public function setRemark(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'annex_type' => 'required|string',
            'row_id' => 'required|integer',
            'batch_id' => 'required|string',
            'hei_id' => 'required|integer',
            'academic_year' => 'required|string',
            'is_best_practice' => 'required|boolean',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $remark = $this->remarkService->setRemark(
            $request->annex_type,
            $request->row_id,
            $request->batch_id,
            $request->hei_id,
            $request->academic_year,
            $request->is_best_practice,
            $request->admin_notes
        );

        return response()->json([
            'success' => true,
            'remark' => [
                'id' => $remark->id,
                'is_best_practice' => $remark->is_best_practice,
                'admin_notes' => $remark->admin_notes,
                'remarked_at' => $remark->remarked_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Batch save multiple remarks
     */
    public function batchSave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'remarks' => 'required|array',
            'remarks.*.annex_type' => 'required|string',
            'remarks.*.row_id' => 'required|integer',
            'remarks.*.batch_id' => 'required|string',
            'remarks.*.hei_id' => 'required|integer',
            'remarks.*.academic_year' => 'required|string',
            'remarks.*.is_best_practice' => 'required|boolean',
            'remarks.*.admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $remarks = $this->remarkService->batchSetRemarks($request->remarks);

        return response()->json([
            'success' => true,
            'message' => count($remarks) . ' remarks saved successfully',
            'count' => count($remarks),
        ]);
    }

    /**
     * Get remarks for a specific HEI and academic year
     */
    public function getRemarks(Request $request, $heiId, $academicYear)
    {
        $annexType = $request->query('annex_type');

        $remarks = $this->remarkService->getRemarksForHEI($heiId, $academicYear, $annexType);

        return response()->json([
            'success' => true,
            'remarks' => $remarks->map(function ($remark) {
                return [
                    'id' => $remark->id,
                    'annex_type' => $remark->annex_type,
                    'row_id' => $remark->row_id,
                    'batch_id' => $remark->batch_id,
                    'is_best_practice' => $remark->is_best_practice,
                    'admin_notes' => $remark->admin_notes,
                    'remarked_at' => $remark->remarked_at->format('Y-m-d H:i:s'),
                    'remarked_by' => $remark->remarkedBy->name,
                ];
            }),
        ]);
    }

    /**
     * Get remarks summary for dashboard
     */
    public function getSummary($heiId, $academicYear)
    {
        $summary = $this->remarkService->getRemarksSummary($heiId, $academicYear);

        return response()->json([
            'success' => true,
            'summary' => $summary,
        ]);
    }
}
