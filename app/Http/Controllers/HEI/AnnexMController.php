<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexMBatch;
use App\Models\AnnexMStatistic;
use App\Models\AnnexMService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexMController extends BaseAnnexController
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
        $existingBatches = AnnexMBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with(['statistics', 'services'])
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/AnnexM/Create', [
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
            'statistics' => 'required|array',
            'statistics.*.category' => 'required|string|max:255',
            'statistics.*.subcategory' => 'nullable|string|max:255',
            'statistics.*.year_data' => 'required|array',
            'statistics.*.is_subtotal' => 'required|boolean',
            'statistics.*.display_order' => 'required|integer',

            'services' => 'nullable|array',
            'services.*.section' => 'required|string|in:' . implode(',', AnnexMService::SECTIONS),
            'services.*.category' => 'nullable|string|max:255',
            'services.*.institutional_services_programs_activities' => 'required|string',
            'services.*.number_of_beneficiaries_participants' => 'required|integer|min:0',
            'services.*.remarks' => 'nullable|string',
            'services.*.display_order' => 'required|integer',

            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexMBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex M');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexMBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexMBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        foreach ($validated['statistics'] as $statistic) {
            $batch->statistics()->create($statistic);
        }

        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $service) {
                $batch->services()->create($service);
            }
        }

        return redirect()->route('hei.annex-m.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexMBatch::where('hei_id', $this->getHeiId())
            ->withCount(['statistics', 'services'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexM/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchData($batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'statistics' => $batch->statistics,
            'services' => $batch->services,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return redirect()->route('hei.annex-m.history')->withErrors([
                'error' => 'Batch not found.'
            ]);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return redirect()->route('hei.annex-m.history')->withErrors([
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
        $existingBatches = AnnexMBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with(['statistics', 'services'])
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/AnnexM/Create', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexMBatch::where('batch_id', $batchId)->first();

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

        return redirect()->route('hei.annex-m.history')->with('success', 'Request cancelled successfully.');
    }
}
