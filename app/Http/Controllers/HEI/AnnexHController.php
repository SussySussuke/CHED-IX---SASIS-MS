<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexHBatch;
use App\Models\AnnexHAdmissionService;
use Illuminate\Http\Request;

class AnnexHController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        return inertia('HEI/Forms/AnnexHCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexHBatch::class, $heiId, ['admissionServices', 'admissionStatistics']),
            'defaultYear' => $this->getDefaultYear()
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

        return redirect()->route('hei.submissions.history')->with('success', $message);
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
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($batch, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        return inertia('HEI/Forms/AnnexHCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $this->getExistingBatches(AnnexHBatch::class, $heiId, ['admissionServices', 'admissionStatistics']),
            'defaultYear' => $batch->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexHBatch::where('batch_id', $batchId)->first();
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
