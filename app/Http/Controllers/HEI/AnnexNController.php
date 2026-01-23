<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexNBatch;
use App\Models\AnnexNActivity;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexNController extends BaseAnnexController
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
        $existingBatches = AnnexNBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('activities')
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/Forms/AnnexNCreate', [
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

        // Validate year is not in the future
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

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexNBatch::where('hei_id', $this->getHeiId())
            ->withCount('activities')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexN/History', [
            'batches' => $batches
        ]);
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
        $existingBatches = AnnexNBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('activities')
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/Forms/AnnexNCreate', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexNBatch::where('batch_id', $batchId)->first();

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
