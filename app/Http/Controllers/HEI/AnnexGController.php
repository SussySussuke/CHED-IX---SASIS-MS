<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexGSubmission;
use App\Models\AnnexGEditorialBoard;
use App\Models\AnnexGOtherPublication;
use App\Models\AnnexGProgram;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnexGController extends BaseAnnexController
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
        $existingBatches = AnnexGSubmission::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->with(['programs', 'editorialBoards', 'otherPublications'])
            ->get()
            ->keyBy('academic_year');

        // Determine default year based on deadline
        $deadline = Setting::getDeadline();
        $isPastDeadline = $deadline && (new \DateTime()) > $deadline;
        $defaultYear = $isPastDeadline
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;

        return inertia('HEI/Forms/AnnexGCreate', [
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
            'official_school_name' => 'nullable|string|max:255',
            'student_publication_name' => 'nullable|string|max:255',
            'publication_fee_per_student' => 'nullable|numeric|min:0',
            'frequency_monthly' => 'boolean',
            'frequency_quarterly' => 'boolean',
            'frequency_annual' => 'boolean',
            'frequency_per_semester' => 'boolean',
            'frequency_others' => 'boolean',
            'frequency_others_specify' => 'nullable|string|max:255',
            'publication_type_newsletter' => 'boolean',
            'publication_type_gazette' => 'boolean',
            'publication_type_magazine' => 'boolean',
            'publication_type_others' => 'boolean',
            'publication_type_others_specify' => 'nullable|string|max:255',
            'adviser_name' => 'nullable|string|max:255',
            'adviser_position_designation' => 'nullable|string|max:255',
            'editorial_boards' => 'nullable|array',
            'editorial_boards.*.name' => 'required|string|max:255',
            'editorial_boards.*.position_in_editorial_board' => 'required|string|max:255',
            'editorial_boards.*.degree_program_year_level' => 'required|string|max:255',
            'other_publications' => 'nullable|array',
            'other_publications.*.name_of_publication' => 'required|string|max:255',
            'other_publications.*.department_unit_in_charge' => 'required|string|max:255',
            'other_publications.*.type_of_publication' => 'required|string|max:100',
            'programs' => 'nullable|array',
            'programs.*.title_of_program' => 'required|string|max:255',
            'programs.*.implementation_date' => 'required|date',
            'programs.*.implementation_venue' => 'required|string|max:255',
            'programs.*.target_group_of_participants' => 'required|string|max:255',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingSubmission = $this->getExistingRecord(AnnexGSubmission::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'Annex G');

        if ($existingSubmission) {
            $this->overwriteExisting(AnnexGSubmission::class, $heiId, $academicYear, $existingSubmission->status);
        }

        $submission = AnnexGSubmission::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            'official_school_name' => $validated['official_school_name'] ?? null,
            'student_publication_name' => $validated['student_publication_name'] ?? null,
            'publication_fee_per_student' => $validated['publication_fee_per_student'] ?? null,
            'frequency_monthly' => $validated['frequency_monthly'] ?? false,
            'frequency_quarterly' => $validated['frequency_quarterly'] ?? false,
            'frequency_annual' => $validated['frequency_annual'] ?? false,
            'frequency_per_semester' => $validated['frequency_per_semester'] ?? false,
            'frequency_others' => $validated['frequency_others'] ?? false,
            'frequency_others_specify' => $validated['frequency_others_specify'] ?? null,
            'publication_type_newsletter' => $validated['publication_type_newsletter'] ?? false,
            'publication_type_gazette' => $validated['publication_type_gazette'] ?? false,
            'publication_type_magazine' => $validated['publication_type_magazine'] ?? false,
            'publication_type_others' => $validated['publication_type_others'] ?? false,
            'publication_type_others_specify' => $validated['publication_type_others_specify'] ?? null,
            'adviser_name' => $validated['adviser_name'] ?? null,
            'adviser_position_designation' => $validated['adviser_position_designation'] ?? null,
            'request_notes' => $validated['request_notes'] ?? null,
        ]);

        if (!empty($validated['editorial_boards'])) {
            foreach ($validated['editorial_boards'] as $board) {
                $submission->editorialBoards()->create($board);
            }
        }

        if (!empty($validated['other_publications'])) {
            foreach ($validated['other_publications'] as $publication) {
                $submission->otherPublications()->create($publication);
            }
        }

        if (!empty($validated['programs'])) {
            foreach ($validated['programs'] as $program) {
                $submission->programs()->create($program);
            }
        }

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function history()
    {
        $submissions = AnnexGSubmission::where('hei_id', $this->getHeiId())
            ->withCount(['editorialBoards', 'otherPublications', 'programs'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('HEI/AnnexG/History', [
            'submissions' => $submissions
        ]);
    }

    public function getSubmissionData($submissionId)
    {
        $submission = AnnexGSubmission::where('submission_id', $submissionId)->first();

        if (!$submission || !$this->checkOwnership($submission, $this->getHeiId())) {
            return response()->json([], $submission ? 403 : 404);
        }

        return response()->json([
            'editorial_boards' => $submission->editorialBoards,
            'other_publications' => $submission->otherPublications,
            'programs' => $submission->programs,
            'form_data' => [
                'official_school_name' => $submission->official_school_name,
                'student_publication_name' => $submission->student_publication_name,
                'publication_fee_per_student' => $submission->publication_fee_per_student,
                'frequency_monthly' => $submission->frequency_monthly,
                'frequency_quarterly' => $submission->frequency_quarterly,
                'frequency_annual' => $submission->frequency_annual,
                'frequency_per_semester' => $submission->frequency_per_semester,
                'frequency_others' => $submission->frequency_others,
                'frequency_others_specify' => $submission->frequency_others_specify,
                'publication_type_newsletter' => $submission->publication_type_newsletter,
                'publication_type_gazette' => $submission->publication_type_gazette,
                'publication_type_magazine' => $submission->publication_type_magazine,
                'publication_type_others' => $submission->publication_type_others,
                'publication_type_others_specify' => $submission->publication_type_others_specify,
                'adviser_name' => $submission->adviser_name,
                'adviser_position_designation' => $submission->adviser_position_designation,
            ],
        ]);
    }

    public function edit($submissionId)
    {
        $submission = AnnexGSubmission::where('submission_id', $submissionId)->first();

        if (!$submission || !$this->checkOwnership($submission, $this->getHeiId())) {
            return redirect()->route('hei.submissions.history')->withErrors([
                'error' => $submission ? 'Unauthorized access.' : 'Submission not found.'
            ]);
        }

        return inertia('HEI/Forms/AnnexGCreate', [
            'existingSubmission' => false,
            'editorialBoards' => $submission->editorialBoards,
            'otherPublications' => $submission->otherPublications,
            'programs' => $submission->programs,
            'formData' => [
                'official_school_name' => $submission->official_school_name,
                'student_publication_name' => $submission->student_publication_name,
                'publication_fee_per_student' => $submission->publication_fee_per_student,
                'frequency_monthly' => $submission->frequency_monthly,
                'frequency_quarterly' => $submission->frequency_quarterly,
                'frequency_annual' => $submission->frequency_annual,
                'frequency_per_semester' => $submission->frequency_per_semester,
                'frequency_others' => $submission->frequency_others,
                'frequency_others_specify' => $submission->frequency_others_specify,
                'publication_type_newsletter' => $submission->publication_type_newsletter,
                'publication_type_gazette' => $submission->publication_type_gazette,
                'publication_type_magazine' => $submission->publication_type_magazine,
                'publication_type_others' => $submission->publication_type_others,
                'publication_type_others_specify' => $submission->publication_type_others_specify,
                'adviser_name' => $submission->adviser_name,
                'adviser_position_designation' => $submission->adviser_position_designation,
            ],
        ]);
    }

    public function cancel(Request $request, $submissionId)
    {
        $submission = AnnexGSubmission::where('submission_id', $submissionId)->first();

        if (!$submission || !$this->checkOwnership($submission, $this->getHeiId())) {
            return redirect()->back()->withErrors([
                'error' => $submission ? 'Unauthorized access.' : 'Submission not found.'
            ]);
        }

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

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
