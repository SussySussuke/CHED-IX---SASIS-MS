<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexOBatch;
use Illuminate\Http\Request;

class AnnexOController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexOCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexOBatch::class, $heiId, ['programs']),
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
            'programs.*.date_conducted' => 'required|date',
            'programs.*.number_of_beneficiaries' => 'required|integer|min:0',
            'programs.*.type_of_community_service' => 'required|string|max:255',
            'programs.*.community_population_served' => 'required|string|max:255',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexOBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex O');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexOBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexOBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['programs'] as $program) {
            $batch->programs()->create($program);
        }

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexOBatch::where('hei_id', $this->getHeiId())
            ->withCount('programs')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexO/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchPrograms($batchId)
    {
        $batch = AnnexOBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'programs' => $batch->programs,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexOBatch::where('batch_id', $batchId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexOCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexOBatch::class, $heiId, ['programs']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexOBatch::where('batch_id', $batchId)->first();
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

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
