<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexIBatch;
use App\Models\AnnexIScholarship;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexIController extends BaseAnnexController
{
    public function create()
    {
        $currentYear = date('Y');
        $heiId = Auth::user()->hei_id;

        // Generate all available academic years (1994 to current year)
        $availableYears = [];
        for ($year = 1994; $year <= $currentYear; $year++) {
            $availableYears[] = $year . '-' . ($year + 1);
        }

        // Get all submissions for this HEI
        $existingBatches = AnnexIBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('scholarships')
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/Forms/AnnexICreate', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'scholarships' => 'required|array|min:1',
            'scholarships.*.scholarship_name' => 'required|string|max:255',
            'scholarships.*.type' => 'required|string|max:255',
            'scholarships.*.category_intended_beneficiaries' => 'required|string|max:255',
            'scholarships.*.number_of_beneficiaries' => 'required|integer|min:0',
            'scholarships.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexIBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex I');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexIBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexIBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['scholarships'] as $scholarship) {
            $batch->scholarships()->create($scholarship);
        }

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexIBatch::where('hei_id', $this->getHeiId())
            ->withCount('scholarships')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexI/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchScholarships($batchId)
    {
        $batch = AnnexIBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'scholarships' => $batch->scholarships,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexIBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return redirect()->route('hei.submissions.history')->withErrors([
                'error' => 'Batch not found.'
            ]);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return redirect()->route('hei.submissions.history')->withErrors([
                'error' => 'Unauthorized access.'
            ]);
        }

        $currentYear = date('Y');
        $heiId = Auth::user()->hei_id;

        // Generate all available academic years (1994 to current year)
        $availableYears = [];
        for ($year = 1994; $year <= $currentYear; $year++) {
            $availableYears[] = $year . '-' . ($year + 1);
        }

        // Get all submissions for this HEI
        $existingBatches = AnnexIBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('scholarships')
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/Forms/AnnexICreate', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexIBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return redirect()->back()->withErrors([
                'error' => $batch ? 'Unauthorized access.' : 'Batch not found.'
            ]);
        }

        if ($batch->status !== 'request') {
            return redirect()->back()->withErrors([
                'error' => 'Only batches with status "request" can be cancelled.'
            ]);
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
