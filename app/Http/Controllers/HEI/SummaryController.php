<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\Summary;
use App\Models\Setting;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SummaryController extends Controller
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
        $existingSubmissions = Summary::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/Forms/SummaryCreate', [
            'availableYears' => $availableYears,
            'existingSubmissions' => $existingSubmissions,
            'defaultYear' => $defaultYear,
            'isEditing' => false
        ]);
    }

    public function store(Request $request)
    {
        $currentYear = date('Y');

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'population_male' => 'required|integer|min:0',
            'population_female' => 'required|integer|min:0',
            'population_intersex' => 'required|integer|min:0',
            'population_total' => 'required|integer|min:0',
            'submitted_org_chart' => 'required|in:yes,no',
            'hei_website' => 'nullable|url',
            'sas_website' => 'nullable|url',
            'social_media_contacts' => 'nullable|array',
            'social_media_contacts.*' => 'nullable|string',
            'student_handbook' => 'nullable|string',
            'student_publication' => 'nullable|string',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $selectedYear = (int) substr($academicYear, 0, 4);
        if ($selectedYear > $currentYear) {
            return redirect()->back()->withErrors([
                'academic_year' => 'Cannot submit for future academic years.'
            ])->withInput();
        }

        // Check if ANY submission exists for selected year
        $existingSubmission = Summary::where('hei_id', Auth::user()->hei_id)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        $newStatus = 'submitted';
        $message = 'Submission created successfully! Waiting for publish date.';

        if ($existingSubmission) {
            if ($existingSubmission->status === 'submitted') {
                // Before publish: overwrite previous submitted
                Summary::where('hei_id', Auth::user()->hei_id)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'submitted')
                    ->update(['status' => 'overwritten']);

                $message = 'Previous submission replaced. New submission waiting for publish date.';
            } elseif ($existingSubmission->status === 'published') {
                // After publish: create request
                $newStatus = 'request';
                $message = 'Update request submitted successfully! Waiting for admin approval.';
            } elseif ($existingSubmission->status === 'request') {
                // Replace existing request
                Summary::where('hei_id', Auth::user()->hei_id)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'request')
                    ->update(['status' => 'overwritten']);

                $newStatus = 'request';
                $message = 'Previous request replaced. New request waiting for admin approval.';
            }
        }

        // Filter out empty social media contacts
        if (isset($validated['social_media_contacts'])) {
            $validated['social_media_contacts'] = array_filter($validated['social_media_contacts'], function($value) {
                return !empty(trim($value));
            });
        }

        Summary::create([
            'hei_id' => Auth::user()->hei_id,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            ...$validated
        ]);

        // Clear caches
        CacheService::clearSubmissionCaches(Auth::user()->hei_id);
        CacheService::clearHeiCaches(Auth::user()->hei_id, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        // Redirect to unified submissions history
        return redirect()->route('hei.submissions.history', ['annex' => 'SUMMARY']);
    }

    public function edit($id)
    {
        $submission = Summary::where('id', $id)
            ->where('hei_id', Auth::user()->hei_id)
            ->firstOrFail();

        $currentYear = date('Y');
        $heiId = Auth::user()->hei_id;

        // Generate all available academic years (1994 to current year)
        $availableYears = [];
        for ($year = 1994; $year <= $currentYear; $year++) {
            $availableYears[] = $year . '-' . ($year + 1);
        }

        // Get all submissions for this HEI
        $existingSubmissions = Summary::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->get()
            ->keyBy('academic_year');

        // Default to the submission's academic year
        $defaultYear = $submission->academic_year;

        return inertia('HEI/Forms/SummaryCreate', [
            'availableYears' => $availableYears,
            'existingSubmissions' => $existingSubmissions,
            'defaultYear' => $defaultYear,
            'isEditing' => true
        ]);
    }

    public function update(Request $request, $id)
    {
        $submissionToEdit = Summary::where('id', $id)
            ->where('hei_id', Auth::user()->hei_id)
            ->firstOrFail();

        // Only allow updating submitted or request status (not cancelled, overwritten, or rejected)
        if (!in_array($submissionToEdit->status, ['submitted', 'request'])) {
            return redirect()->back()->withErrors([
                'error' => 'You can only edit submissions with status "submitted" or "request". Cancelled, overwritten, and rejected submissions cannot be edited.'
            ]);
        }

        $validated = $request->validate([
            'population_male' => 'required|integer|min:0',
            'population_female' => 'required|integer|min:0',
            'population_intersex' => 'required|integer|min:0',
            'population_total' => 'required|integer|min:0',
            'submitted_org_chart' => 'required|in:yes,no',
            'hei_website' => 'nullable|url',
            'sas_website' => 'nullable|url',
            'social_media_contacts' => 'nullable|array',
            'social_media_contacts.*' => 'nullable|string',
            'student_handbook' => 'nullable|string',
            'student_publication' => 'nullable|string',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        // Filter out empty social media contacts
        if (isset($validated['social_media_contacts'])) {
            $validated['social_media_contacts'] = array_filter($validated['social_media_contacts'], function($value) {
                return !empty(trim($value));
            });
        }

        // Mark ALL existing 'request' submissions for this academic year as 'overwritten'
        Summary::where('hei_id', Auth::user()->hei_id)
            ->where('academic_year', $submissionToEdit->academic_year)
            ->where('status', 'request')
            ->update(['status' => 'overwritten']);

        // Create new submission with status 'request'
        Summary::create([
            'hei_id' => Auth::user()->hei_id,
            'academic_year' => $submissionToEdit->academic_year,
            'status' => 'request',
            ...$validated
        ]);

        // Clear caches
        CacheService::clearSubmissionCaches(Auth::user()->hei_id);
        CacheService::clearHeiCaches(Auth::user()->hei_id, $submissionToEdit->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'Update request submitted successfully! Waiting for admin approval.');
    }

    public function cancel(Request $request, $id)
    {
        $submission = Summary::where('id', $id)
            ->where('hei_id', Auth::user()->hei_id)
            ->firstOrFail();

        // Only allow cancelling 'request' status
        if ($submission->status !== 'request') {
            return redirect()->back()->withErrors([
                'error' => 'Only submissions with status "request" can be cancelled.'
            ]);
        }

        $validated = $request->validate([
            'cancelled_notes' => 'nullable|string|max:1000'
        ]);

        $submission->update([
            'status' => 'cancelled',
            'cancelled_notes' => $validated['cancelled_notes'] ?? null
        ]);

        // Clear caches
        CacheService::clearSubmissionCaches(Auth::user()->hei_id);
        CacheService::clearHeiCaches(Auth::user()->hei_id, $submission->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
