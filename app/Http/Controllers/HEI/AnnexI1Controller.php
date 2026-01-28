<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexI1Batch;
use Illuminate\Http\Request;

class AnnexI1Controller extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexI1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexI1Batch::class, $heiId, ['foodServices']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'foodServices' => 'required|array|min:1',
            'foodServices.*.service_name' => 'required|string|max:255',
            'foodServices.*.service_type' => 'required|string|max:255',
            'foodServices.*.operator_name' => 'required|string|max:255',
            'foodServices.*.location' => 'required|string|max:255',
            'foodServices.*.number_of_students_served' => 'nullable|integer|min:0',
            'foodServices.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexI1Batch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex I-1');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexI1Batch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexI1Batch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['foodServices'] as $service) {
            $batch->foodServices()->create($service);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexI1Batch::where('hei_id', $this->getHeiId())
            ->withCount('foodServices')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexI1/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchFoodServices($batchId)
    {
        $batch = AnnexI1Batch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'foodServices' => $batch->foodServices,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexI1Batch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexI1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexI1Batch::class, $heiId, ['foodServices']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexI1Batch::where('batch_id', $batchId)->first();
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
