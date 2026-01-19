<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\AnnexEBatch;
use App\Models\AnnexEOrganization;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexEController extends Controller
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
        $existingBatches = AnnexEBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('organizations')
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/AnnexE/Create', [
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

        // Validate year is not in the future
        $selectedYear = (int) substr($academicYear, 0, 4);
        if ($selectedYear > $currentYear) {
            return redirect()->back()->withErrors([
                'academic_year' => 'Cannot submit for future academic years.'
            ])->withInput();
        }

        $heiId = Auth::user()->hei_id;

        // Check for existing submission for this year
        $existingBatch = AnnexEBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        $newStatus = 'submitted';
        $message = 'Annex E batch submitted successfully! Waiting for publish date.';

        if ($existingBatch) {
            if ($existingBatch->status === 'submitted') {
                // Before publish: overwrite previous submitted
                AnnexEBatch::where('hei_id', $heiId)
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
                AnnexEBatch::where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'request')
                    ->update(['status' => 'overwritten']);

                $newStatus = 'request';
                $message = 'Previous request replaced. New request waiting for admin approval.';
            }
        }

        // Create new batch
        $batch = AnnexEBatch::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        // Create organizations
        foreach ($validated['organizations'] as $organization) {
            $batch->organizations()->create($organization);
        }

        return redirect()->route('hei.annex-e.history')->with('success', $message);
    }

    public function history()
    {
        $batches = AnnexEBatch::where('hei_id', Auth::user()->hei_id)
            ->withCount('organizations')
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexE/History', [
            'batches' => $batches
        ]);
    }

    public function getBatchOrganizations($batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return response()->json([], 404);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return response()->json([], 403);
        }

        return response()->json($batch->organizations);
    }

    public function edit($batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();

        if (!$batch) {
            return redirect()->route('hei.annex-e.history')->withErrors([
                'error' => 'Batch not found.'
            ]);
        }

        // Check ownership
        if ($batch->hei_id !== Auth::user()->hei_id) {
            return redirect()->route('hei.annex-e.history')->withErrors([
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
        $existingBatches = AnnexEBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with('organizations')
            ->get()
            ->keyBy('academic_year');

        // Default to the batch's academic year
        $defaultYear = $batch->academic_year;

        return inertia('HEI/AnnexE/Create', [
            'availableYears' => $availableYears,
            'existingBatches' => $existingBatches,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $batchId)
    {
        $batch = AnnexEBatch::where('batch_id', $batchId)->first();

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

        return redirect()->route('hei.annex-e.history')->with('success', 'Request cancelled successfully.');
    }
}
