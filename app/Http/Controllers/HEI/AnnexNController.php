<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexNBatch;
use Illuminate\Http\Request;

class AnnexNController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexNCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexNBatch::class, $heiId, ['activities']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'activities' => 'required|array|min:1',
            'activities.*.title_of_activity' => 'required|string|max:255',
            'activities.*.implementation_date' => 'required|date',
            'activities.*.implementation_venue' => 'required|string|max:255',
            'activities.*.participants_online' => 'nullable|integer|min:0',
            'activities.*.participants_face_to_face' => 'nullable|integer|min:0',
            'activities.*.organizer' => 'required|string|max:255',
            'activities.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexNBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex N');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexNBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexNBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['activities'] as $activity) {
            $batch->activities()->create([
                'title_of_activity' => $activity['title_of_activity'],
                'implementation_date' => $activity['implementation_date'],
                'implementation_venue' => $activity['implementation_venue'],
                'number_of_participants' => ($activity['participants_online'] ?? 0) + ($activity['participants_face_to_face'] ?? 0),
                'organizer' => $activity['organizer'],
                'remarks' => $activity['remarks'] ?? null,
            ]);
        }

        // Clear caches
        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchActivities($batchId)
    {
        $batch = AnnexNBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'activities' => $batch->activities,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexNBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexNCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexNBatch::class, $heiId, ['activities']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexNBatch::where('batch_id', $batchId)->first();
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
