<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\AnnexDSubmission;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexDController extends Controller
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
        $existingBatches = AnnexDBatch::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/AnnexD/Create', [
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
            'version_publication_date' => 'nullable|string|max:255',
            'officer_in_charge' => 'nullable|string|max:255',
            'handbook_committee' => 'nullable|string',
            'dissemination_orientation' => 'boolean',
            'orientation_dates' => 'nullable|string|max:255',
            'mode_of_delivery' => 'nullable|string|max:255',
            'dissemination_uploaded' => 'boolean',
            'dissemination_others' => 'boolean',
            'dissemination_others_text' => 'nullable|string|max:255',
            'type_digital' => 'boolean',
            'type_printed' => 'boolean',
            'type_others' => 'boolean',
            'type_others_text' => 'nullable|string|max:255',
            'has_academic_policies' => 'boolean',
            'has_admission_requirements' => 'boolean',
            'has_code_of_conduct' => 'boolean',
            'has_scholarships' => 'boolean',
            'has_student_publication' => 'boolean',
            'has_housing_services' => 'boolean',
            'has_disability_services' => 'boolean',
            'has_student_council' => 'boolean',
            'has_refund_policies' => 'boolean',
            'has_drug_education' => 'boolean',
            'has_foreign_students' => 'boolean',
            'has_disaster_management' => 'boolean',
            'has_safe_spaces' => 'boolean',
            'has_anti_hazing' => 'boolean',
            'has_anti_bullying' => 'boolean',
            'has_violence_against_women' => 'boolean',
            'has_gender_fair' => 'boolean',
            'has_others' => 'boolean',
            'has_others_text' => 'nullable|string|max:255',
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
        $existingSubmission = AnnexDSubmission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        $newStatus = 'submitted';
        $message = 'Annex D submitted successfully! Waiting for publish date.';

        if ($existingSubmission) {
            if ($existingSubmission->status === 'submitted') {
                // Before publish: overwrite previous submitted
                AnnexDSubmission::where('hei_id', $heiId)
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
                AnnexDSubmission::where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->where('status', 'request')
                    ->update(['status' => 'overwritten']);

                $newStatus = 'request';
                $message = 'Previous request replaced. New request waiting for admin approval.';
            }
        }

        // Create new submission
        AnnexDSubmission::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            ...$validated,
        ]);

        return redirect()->route('hei.annex-d.history')->with('success', $message);
    }

    public function history()
    {
        $submissions = AnnexDSubmission::where('hei_id', Auth::user()->hei_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexD/History', [
            'submissions' => $submissions
        ]);
    }

    public function edit($submissionId)
    {
        $submission = AnnexDSubmission::where('submission_id', $submissionId)->first();

        if (!$submission) {
            return redirect()->route('hei.annex-d.history')->withErrors([
                'error' => 'Submission not found.'
            ]);
        }

        // Check ownership
        if ($submission->hei_id !== Auth::user()->hei_id) {
            return redirect()->route('hei.annex-d.history')->withErrors([
                'error' => 'Unauthorized access.'
            ]);
        }

        return inertia('HEI/AnnexD/Create', [
            'existingSubmission' => false,
            'formData' => $submission
        ]);
    }

    public function cancel(Request $request, $submissionId)
    {
        $submission = AnnexDSubmission::where('submission_id', $submissionId)->first();

        if (!$submission) {
            return redirect()->back()->withErrors([
                'error' => 'Submission not found.'
            ]);
        }

        // Check ownership
        if ($submission->hei_id !== Auth::user()->hei_id) {
            return redirect()->back()->withErrors([
                'error' => 'Unauthorized access.'
            ]);
        }

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
            'cancelled_notes' => $validated['cancelled_notes'] ?? null,
        ]);

        return redirect()->route('hei.annex-d.history')->with('success', 'Request cancelled successfully.');
    }
}
