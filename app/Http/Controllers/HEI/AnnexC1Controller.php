<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexC1Batch;
use Illuminate\Http\Request;

class AnnexC1Controller extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexC1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexC1Batch::class, $heiId, ['programs']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'programs' => 'required|array|min:1',
            'programs.*.title' => 'required|string|max:255',
            'programs.*.venue' => 'required|string|max:255',
            'programs.*.implementation_date' => 'required|date',
            'programs.*.target_group' => 'required|string',
            'programs.*.participants_online' => 'required|integer|min:0',
            'programs.*.participants_face_to_face' => 'required|integer|min:0',
            'programs.*.organizer' => 'required|string|max:255',
            'programs.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexC1Batch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex C-1');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexC1Batch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexC1Batch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['programs'] as $program) {
            $batch->programs()->create($program);
        }

        // Clear caches
        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexC1Batch::where('hei_id', $this->getHeiId())
            ->withCount('programs')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexC1/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchPrograms($batchId)
    {
        $batch = AnnexC1Batch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json($batch->programs);
    }

    public function edit($batchId)
    {
        $batch = AnnexC1Batch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexC1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexC1Batch::class, $heiId, ['programs']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexC1Batch::where('batch_id', $batchId)->first();
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

        // Clear caches
        $this->clearSubmissionCaches($heiId, $batch->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
