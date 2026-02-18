<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexJBatch;
use Illuminate\Http\Request;

class AnnexJController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexJCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexJBatch::class, $heiId, ['programs']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'programs' => 'required|array|min:1',
            'programs.*.title_of_program' => 'required|string|max:255',
            'programs.*.organizer' => 'required|string|max:255',
            'programs.*.participants_online' => 'nullable|integer|min:0',
            'programs.*.participants_face_to_face' => 'nullable|integer|min:0',
            'programs.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexJBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex J');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexJBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexJBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['programs'] as $program) {
            $batch->programs()->create([
                'title_of_program' => $program['title_of_program'],
                'organizer' => $program['organizer'],
                'number_of_participants' => ($program['participants_online'] ?? 0) + ($program['participants_face_to_face'] ?? 0),
                'remarks' => $program['remarks'] ?? null,
            ]);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchPrograms($batchId)
    {
        $batch = AnnexJBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'programs' => $batch->programs,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexJBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexJCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexJBatch::class, $heiId, ['programs']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexJBatch::where('batch_id', $batchId)->first();
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
