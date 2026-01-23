<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\AnnexCBatch;
use App\Models\AnnexCProgram;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexCController extends Controller
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
        $existingBatches = AnnexCBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/Forms/AnnexCCreate', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear
        ]);
    }

    public function store(Request $request)
    {
        $currentYear = date('Y');

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'programs' => 'required|array|min:1',
            'programs.*.title' => 'required|string|max:255',
            'programs.*.venue' => 'required|string|max:255',
            'programs.*.implementation_date' => 'required|date',
            'programs.*.participants_online' => 'required|integer|min:0',
            'programs.*.participants_face_to_face' => 'required|integer|min:0',
            'programs.*.organizer' => 'required|string|max:255',
            'programs.*.remarks' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $selectedYear = (int) substr($academicYear, 0, 4);
        if ($selectedYear > $currentYear) {
            return redirect()->back()->withErrors([
                'academic_year' => 'Cannot submit for future academic years.'
            ])->withInput();
        }

        $heiId = Auth::user()->hei_id;

        // Check for existing submission for this year
        $existingBatch = AnnexCBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        $newStatus = 'submitted';
        $message = 'Annex C batch submitted successfully! Waiting for publish date.';

        if ($existingBatch) {
            if ($existingBatch->status === 'submitted') {
                // Before publish: overwrite previous submitted
                AnnexCBatch::where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'submitted')
                    ->update(['status' => 'overwritten']);

                $message = 'Previous submission replaced. New submission waiting for publish date.';
            } elseif ($existingBatch->status === 'published') {
                // After publish: create request
                $newStatus = 'request';
                $message = 'Update request submitted successfully! Waiting for admin approval.';
            } elseif ($existingBatch->status === 'request') {
                // Replace existing request
                AnnexCBatch::where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'request')
                    ->update(['status' => 'overwritten']);

                $newStatus = 'request';
                $message = 'Previous request replaced. New request waiting for admin approval.';
            }
        }

        // Create new batch
        $batch = AnnexCBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        // Create programs
        foreach ($validated['programs'] as $program) {
            $batch->programs()->create($program);
        }

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexCBatch::where('hei_id', Auth::user()->hei_id)
            ->withCount('programs')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexC/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchPrograms($batchId)
    {
        $batch = AnnexCBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return response()->json([], 404);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return response()->json([], 403);
        }

        return response()->json($batch->programs);
    }

    public function edit($batchId)
    {
        $batch = AnnexCBatch::where('batch_id', $batchId)->first();

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
        $existingBatches = AnnexCBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/Forms/AnnexCCreate', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexCBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return redirect()->back()->withErrors([
                'error' => 'Batch not found.'
            ]);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return redirect()->back()->withErrors([
                'error' => 'Unauthorized access.'
            ]);
        }

        // Only allow cancelling 'request' status
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
