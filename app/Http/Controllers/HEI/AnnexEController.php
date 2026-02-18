<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexEBatch;
use Illuminate\Http\Request;

class AnnexEController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexECreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexEBatch::class, $heiId, ['organizations']),
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'organizations' => 'required|array|min:1',
            'organizations.*.name_of_accredited' => 'required|string|max:255',
            'organizations.*.years_of_existence' => 'required|integer|min:0',
            'organizations.*.accredited_since' => 'required|string|max:255',
            'organizations.*.faculty_adviser' => 'nullable|string|max:255',
            'organizations.*.president_and_officers' => 'required|string',
            'organizations.*.specialization' => 'required|string|max:255',
            'organizations.*.fee_collected' => 'nullable|string|max:255',
            'organizations.*.programs_projects_activities' => 'required|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexEBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex E');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexEBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexEBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['organizations'] as $organization) {
            $batch->organizations()->create($organization);
        }

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function getBatchOrganizations($batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json($batch->organizations);
    }

    public function edit($batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexECreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexEBatch::class, $heiId, ['organizations']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();
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
