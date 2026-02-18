<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexL1Batch;
use Illuminate\Http\Request;

class AnnexL1Controller extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexL1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexL1Batch::class, $heiId, ['internationalServices']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'internationalServices' => 'required|array|min:1',
            'internationalServices.*.service_name' => 'required|string|max:255',
            'internationalServices.*.service_type' => 'required|string|max:255',
            'internationalServices.*.target_nationality' => 'required|string|max:255',
            'internationalServices.*.number_of_students_served' => 'nullable|integer|min:0',
            'internationalServices.*.officer_in_charge' => 'required|string|max:255',
            'internationalServices.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexL1Batch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex L-1');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexL1Batch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexL1Batch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['internationalServices'] as $service) {
            $batch->internationalServices()->create($service);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchInternationalServices($batchId)
    {
        $batch = AnnexL1Batch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'internationalServices' => $batch->internationalServices,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexL1Batch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexL1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexL1Batch::class, $heiId, ['internationalServices']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexL1Batch::where('batch_id', $batchId)->first();
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
