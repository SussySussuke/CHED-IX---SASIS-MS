<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexN1Batch;
use Illuminate\Http\Request;

class AnnexN1Controller extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexN1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexN1Batch::class, $heiId, ['sportsPrograms']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'sportsPrograms' => 'required|array|min:1',
            'sportsPrograms.*.program_title' => 'required|string|max:255',
            'sportsPrograms.*.sport_type' => 'required|string|max:255',
            'sportsPrograms.*.implementation_date' => 'required|date',
            'sportsPrograms.*.venue' => 'required|string|max:255',
            'sportsPrograms.*.participants_count' => 'nullable|integer|min:0',
            'sportsPrograms.*.organizer' => 'required|string|max:255',
            'sportsPrograms.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexN1Batch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex N-1');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexN1Batch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexN1Batch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['sportsPrograms'] as $program) {
            $batch->sportsPrograms()->create($program);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchSportsPrograms($batchId)
    {
        $batch = AnnexN1Batch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'sportsPrograms' => $batch->sportsPrograms,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexN1Batch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexN1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexN1Batch::class, $heiId, ['sportsPrograms']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexN1Batch::where('batch_id', $batchId)->first();
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
