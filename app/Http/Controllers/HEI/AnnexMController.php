<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexMBatch;
use App\Models\AnnexMService;
use Illuminate\Http\Request;

class AnnexMController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexMCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexMBatch::class, $heiId, ['statistics', 'services']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'statistics' => 'required|array',
            'statistics.*.category' => 'required|string|max:255',
            'statistics.*.subcategory' => 'nullable|string|max:255',
            'statistics.*.year_data' => 'required|array',
            'statistics.*.is_subtotal' => 'required|boolean',
            'statistics.*.display_order' => 'required|integer',

            'services' => 'nullable|array',
            'services.*.section' => 'required|string|in:' . implode(',', AnnexMService::SECTIONS),
            'services.*.category' => 'nullable|string|max:255',
            'services.*.institutional_services_programs_activities' => 'required|string',
            'services.*.number_of_beneficiaries_participants' => 'required|integer|min:0',
            'services.*.remarks' => 'nullable|string',
            'services.*.display_order' => 'required|integer',

            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexMBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex M');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexMBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexMBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['statistics'] as $statistic) {
            $batch->statistics()->create($statistic);
        }

        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $service) {
                $batch->services()->create($service);
            }
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchData($batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'statistics' => $batch->statistics,
            'services' => $batch->services,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexMCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexMBatch::class, $heiId, ['statistics', 'services']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateCancelRequest($batch, $heiId);
        if ($error) {
            return redirect()->back()->withErrors($error);
        }

        $validated = $request->validate([
            'cancelled_notes' => 'nullable|string|max:1000'
        ]);

        $batch->update([
            'status' => 'cancelled',
            'cancelled_notes' => $validated['cancelled_notes'] ?? null,
        ]);

        $this->clearSubmissionCaches($heiId, $batch->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
