<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\HEI;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        // Current academic year (can be auto-calculated based on current date)
        $currentYear = '2026-2027';
        $defaultStatus = 'submitted';

        // Start with base query
        $query = Submission::with('hei');

        // Filter by status (default to 'submitted')
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        } else {
            // Default to 'submitted' status
            $query->where('status', $defaultStatus);
        }

        // Filter by HEI if provided
        if ($request->has('hei_id') && $request->hei_id) {
            $query->where('hei_id', $request->hei_id);
        }

        // Filter by academic year
        if ($request->has('year') && $request->year && $request->year !== 'All Time') {
            $query->where('academic_year', $request->year);
        } elseif (!$request->has('year') || !$request->year) {
            // Default to current year if no filter provided
            $query->where('academic_year', $currentYear);
        }
        // If 'All Time' is selected, no year filter is applied

        $submissions = $query->orderBy('created_at', 'desc')->get();

        // Get all HEIs for filter dropdown
        $heis = HEI::orderBy('name')->get();

        // Get unique academic years for filter dropdown
        $academicYears = Submission::select('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year')
            ->toArray();

        // Add "All Time" option at the end
        $academicYears[] = 'All Time';

        return inertia('Admin/Submissions/Index', [
            'submissions' => $submissions,
            'heis' => $heis,
            'academicYears' => $academicYears,
            'currentYear' => $currentYear,
            'filters' => [
                'hei_id' => $request->hei_id,
                'year' => $request->year ?? $currentYear,
                'status' => $request->status ?? $defaultStatus,
            ]
        ]);
    }

    public function requests(Request $request)
    {
        // Get all submissions with status 'request' (pending overwrite approval)
        $query = Submission::with('hei')
            ->where('status', 'request');

        // Filter by HEI if provided
        if ($request->has('hei_id') && $request->hei_id) {
            $query->where('hei_id', $request->hei_id);
        }

        // Sort by oldest first
        $submissions = $query->orderBy('created_at', 'asc')->get();

        // Get all HEIs for filter dropdown
        $heis = HEI::orderBy('name')->get();

        return inertia('Admin/Submissions/Requests', [
            'submissions' => $submissions,
            'heis' => $heis,
            'filters' => [
                'hei_id' => $request->hei_id,
            ]
        ]);
    }

    public function show($id)
    {
        $submission = Submission::with('hei')->findOrFail($id);

        // Find the current 'submitted' record for the same HEI and academic year
        $currentSubmitted = null;
        if ($submission->status === 'request') {
            $currentSubmitted = Submission::where('hei_id', $submission->hei_id)
                ->where('academic_year', $submission->academic_year)
                ->where('status', 'submitted')
                ->first();
        }

        return inertia('Admin/Submissions/View', [
            'submission' => $submission,
            'currentSubmitted' => $currentSubmitted
        ]);
    }

    public function approve($id)
    {
        DB::beginTransaction();

        try {
            $requestSubmission = Submission::findOrFail($id);

            // Only allow approving 'request' status
            if ($requestSubmission->status !== 'request') {
                return redirect()->back()->withErrors([
                    'error' => 'Only submissions with status "request" can be approved.'
                ]);
            }

            // Find current 'submitted' for the same HEI and academic year
            $currentSubmitted = Submission::where('hei_id', $requestSubmission->hei_id)
                ->where('academic_year', $requestSubmission->academic_year)
                ->where('status', 'submitted')
                ->first();

            // Mark current 'submitted' as 'overwritten'
            if ($currentSubmitted) {
                $currentSubmitted->update(['status' => 'overwritten']);
            }

            // Change 'request' to 'submitted'
            $requestSubmission->update(['status' => 'submitted']);

            DB::commit();

            return redirect()->route('admin.submissions.requests')->with('success', 'Request approved successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to approve request: ' . $e->getMessage()
            ]);
        }
    }

    public function reject($id)
    {
        DB::beginTransaction();

        try {
            $requestSubmission = Submission::findOrFail($id);

            // Only allow rejecting 'request' status
            if ($requestSubmission->status !== 'request') {
                return redirect()->back()->withErrors([
                    'error' => 'Only submissions with status "request" can be rejected.'
                ]);
            }

            // Change 'request' to 'rejected'
            $requestSubmission->update(['status' => 'rejected']);

            DB::commit();

            return redirect()->route('admin.submissions.requests')->with('success', 'Request rejected successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'error' => 'Failed to reject request: ' . $e->getMessage()
            ]);
        }
    }
}
