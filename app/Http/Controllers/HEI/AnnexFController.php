<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexFBatch;
use Illuminate\Http\Request;

class AnnexFController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        $existingBatches = AnnexFBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('activities')
            ->get()
            ->map(function ($batch) {
                return [
                    'batch_id' => $batch->batch_id,
                    'academic_year' => $batch->academic_year,
                    'status' => $batch->status,
                    'activities' => $batch->activities,
                    'formData' => [
                        'procedure_mechanism' => $batch->procedure_mechanism,
                        'complaint_desk' => $batch->complaint_desk,
                    ],
                    'created_at' => $batch->created_at,
                    'updated_at' => $batch->updated_at,
                ];
            })
            ->keyBy('academic_year');

        return inertia('HEI/Forms/AnnexFCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $existingBatches,
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'procedure_mechanism' => 'nullable|string|max:255',
            'complaint_desk' => 'nullable|string|max:255',
            'activities' => 'required|array|min:1',
            'activities.*.activity' => 'required|string|max:255',
            'activities.*.date' => 'required|date',
            'activities.*.status' => 'required|string|max:255',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexFBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex F');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexFBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexFBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'procedure_mechanism' => $validated['procedure_mechanism'] ?? null,
            'complaint_desk' => $validated['complaint_desk'] ?? null,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['activities'] as $activity) {
            $batch->activities()->create($activity);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexFBatch::where('hei_id', $this->getHeiId())
            ->withCount('activities')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexF/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchActivities($batchId)
    {
        $batch = AnnexFBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'activities' => $batch->activities,
            'procedure_mechanism' => $batch->procedure_mechanism,
            'complaint_desk' => $batch->complaint_desk,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexFBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        $existingBatches = AnnexFBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('activities')
            ->get()
            ->map(function ($b) {
                return [
                    'batch_id' => $b->batch_id,
                    'academic_year' => $b->academic_year,
                    'status' => $b->status,
                    'activities' => $b->activities,
                    'formData' => [
                        'procedure_mechanism' => $b->procedure_mechanism,
                        'complaint_desk' => $b->complaint_desk,
                    ],
                    'created_at' => $b->created_at,
                    'updated_at' => $b->updated_at,
                ];
            })
            ->keyBy('academic_year');

        return inertia('HEI/Forms/AnnexFCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $existingBatches,
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexFBatch::where('batch_id', $batchId)->first();
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
