<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexHBatch;
use App\Models\AnnexHAdmissionService;
use App\Models\AnnexHAdmissionStatistic;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexHController extends BaseAnnexController
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
        $existingBatches = AnnexHBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with(['admissionServices', 'admissionStatistics'])
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/AnnexH/Create', [
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
            'admission_services' => 'required|array|size:8',
            'admission_services.*.service_type' => 'required|in:' . implode(',', AnnexHAdmissionService::PREDEFINED_SERVICES),
            'admission_services.*.with' => 'required|boolean',
            'admission_services.*.supporting_documents' => 'nullable|string',
            'admission_services.*.remarks' => 'nullable|string',
            'admission_statistics' => 'nullable|array',
            'admission_statistics.*.program' => 'required|string|max:255',
            'admission_statistics.*.applicants' => 'required|integer|min:0',
            'admission_statistics.*.admitted' => 'required|integer|min:0',
            'admission_statistics.*.enrolled' => 'required|integer|min:0',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingBatch = $this->getExistingRecord(AnnexHBatch::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingBatch, 'Annex H');

        if ($existingBatch) {
            $this->overwriteExisting(AnnexHBatch::class, $heiId, $academicYear, $existingBatch->status);
        }

        $batch = AnnexHBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        if (!empty($validated['admission_services'])) {
            foreach ($validated['admission_services'] as $service) {
                $batch->admissionServices()->create($service);
            }
        }

        if (!empty($validated['admission_statistics'])) {
            foreach ($validated['admission_statistics'] as $statistic) {
                $batch->admissionStatistics()->create($statistic);
            }
        }

        return redirect()->route('hei.annex-h.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexHBatch::where('hei_id', $this->getHeiId())
            ->withCount(['admissionServices', 'admissionStatistics'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexH/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchData($batchId)
    {
        $batch = AnnexHBatch::where('batch_id', $batchId)->first();

        if (!$batch || !$this->checkOwnership($batch, $this->getHeiId())) {
            return response()->json([], $batch ? 403 : 404);
        }

        return response()->json([
            'admission_services' => $batch->admissionServices,
            'admission_statistics' => $batch->admissionStatistics,
        ]);
    }

    public function edit($batchId)
    {
        $batch = AnnexHBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return redirect()->route('hei.annex-h.history')->withErrors([
                'error' => 'Batch not found.'
            ]);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return redirect()->route('hei.annex-h.history')->withErrors([
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
        $existingBatches = AnnexHBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with(['admissionServices', 'admissionStatistics'])
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/AnnexH/Create', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexHBatch::where('batch_id', $batchId)->first();

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

        return redirect()->route('hei.annex-h.history')->with('success', 'Request cancelled successfully.');
    }
}
