<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexLBatch;
use Illuminate\Http\Request;

class AnnexLController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexLCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexLBatch::class, $heiId, ['housing']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'housing' => 'required|array|min:1',
            'housing.*.housing_name' => 'required|string|max:255',
            'housing.*.complete_address' => 'required|string|max:255',
            'housing.*.house_manager_name' => 'required|string|max:255',
            'housing.*.male' => 'required|boolean',
            'housing.*.female' => 'required|boolean',
            'housing.*.coed' => 'required|boolean',
            'housing.*.others' => 'nullable|string|max:255',
            'housing.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexLBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex L');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexLBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexLBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['housing'] as $house) {
            $batch->housing()->create($house);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexLBatch::where('hei_id', $this->getHeiId())
            ->withCount('housing')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexL/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchHousing($batchId)
    {
        $batch = AnnexLBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'housing' => $batch->housing,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexLBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexLCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexLBatch::class, $heiId, ['housing']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexLBatch::where('batch_id', $batchId)->first();
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
