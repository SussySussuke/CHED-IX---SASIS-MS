<?php

namespace App\Http\Controllers\HEI;

use App\Models\MER1Submission;
use App\Models\MER1EducationalAttainment;
use App\Models\MER1Training;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MER1Controller extends BaseAnnexController
{
    /**
     * Show the MER1 creation/edit form
     */
    public function create()
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();
        
        // Get all existing submissions for this HEI with related data
        $existingSubmissions = MER1Submission::where('hei_id', $heiId)
            ->with(['educationalAttainments', 'trainings'])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $submission) {
            $existingData[$year] = [
                'id' => $submission->id,
                'academic_year' => $submission->academic_year,
                'status' => $submission->status,
                'hei_name' => $submission->hei_name,
                'hei_code' => $submission->hei_code,
                'hei_type' => $submission->hei_type,
                'hei_address' => $submission->hei_address,
                'sas_head_name' => $submission->sas_head_name,
                'sas_head_position' => $submission->sas_head_position,
                'permanent_status' => $submission->permanent_status,
                'other_achievements' => $submission->other_achievements,
                'educational_attainments' => $submission->educationalAttainments->toArray(),
                'trainings' => $submission->trainings->toArray(),
                'request_notes' => $submission->request_notes,
            ];
        }
        
        // Ensure existingData is always an object (not an array) for JavaScript
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $this->getCurrentAcademicYear(),
        ]);
    }

    /**
     * Store or update MER1 submission
     */
    public function store(Request $request)
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'sas_head_name' => 'required|string|max:255',
            'sas_head_position' => 'required|string|max:255',
            'permanent_status' => 'nullable|string|max:255',
            'other_achievements' => 'nullable|string',
            'educational_attainments' => 'nullable|array',
            'educational_attainments.*.degree_program' => 'nullable|string|max:255',
            'educational_attainments.*.school' => 'nullable|string|max:255',
            'educational_attainments.*.year' => 'nullable|string|max:4',
            'trainings' => 'nullable|array',
            'trainings.*.training_title' => 'nullable|string|max:255',
            'trainings.*.period_date' => 'nullable|string|max:255',
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate academic year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        // Check for existing submission
        $existingSubmission = MER1Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        // Determine new status and message
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'MER1');

        DB::beginTransaction();
        try {
            // If overwriting existing, mark old as overwritten
            if ($existingSubmission) {
                $this->overwriteExisting(MER1Submission::class, $heiId, $academicYear, $existingSubmission->status);
            }
            
            // Create new submission
            $submission = MER1Submission::create([
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
                'status' => $newStatus,
                
                // Form fields only (HEI profile comes from join)
                'sas_head_name' => $validated['sas_head_name'],
                'sas_head_position' => $validated['sas_head_position'],
                'permanent_status' => $validated['permanent_status'] ?? null,
                'other_achievements' => $validated['other_achievements'] ?? null,
                'request_notes' => $validated['request_notes'] ?? null,
            ]);

            // Save educational attainments (filter out empty rows)
            if (!empty($validated['educational_attainments'])) {
                foreach ($validated['educational_attainments'] as $attainment) {
                    // Only save if at least degree_program is filled
                    if (!empty($attainment['degree_program'])) {
                        $submission->educationalAttainments()->create([
                            'degree_program' => $attainment['degree_program'],
                            'school' => $attainment['school'] ?? '',
                            'year' => $attainment['year'] ?? null,
                        ]);
                    }
                }
            }

            // Save trainings (filter out empty rows)
            if (!empty($validated['trainings'])) {
                foreach ($validated['trainings'] as $training) {
                    // Only save if at least training_title is filled
                    if (!empty($training['training_title'])) {
                        $submission->trainings()->create([
                            'training_title' => $training['training_title'],
                            'period_date' => $training['period_date'] ?? '',
                        ]);
                    }
                }
            }

            DB::commit();

            // Clear caches
            $this->clearSubmissionCaches($heiId, $academicYear);

            return redirect()->route('hei.submissions.history')->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('MER1 submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
            ]);
            
            // Return the actual error message for debugging
            $errorMessage = config('app.debug') 
                ? 'Failed to save MER1 submission: ' . $e->getMessage()
                : 'Failed to save MER1 submission. Please try again.';
            
            return redirect()->back()->withErrors(['error' => $errorMessage])->withInput();
        }
    }

    /**
     * Get MER1 data for a specific year (AJAX endpoint)
     */
    public function getData($academicYear)
    {
        $heiId = $this->getHeiId();
        
        $submission = MER1Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->with(['educationalAttainments', 'trainings'])
            ->first();

        if (!$submission) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $submission->id,
            'academic_year' => $submission->academic_year,
            'status' => $submission->status,
            'sas_head_name' => $submission->sas_head_name,
            'sas_head_position' => $submission->sas_head_position,
            'permanent_status' => $submission->permanent_status,
            'other_achievements' => $submission->other_achievements,
            'educational_attainments' => $submission->educationalAttainments,
            'trainings' => $submission->trainings,
        ]);
    }

    /**
     * Edit an existing MER1 submission
     */
    public function edit($submissionId)
    {
        $submission = MER1Submission::findOrFail($submissionId);
        $heiId = $this->getHeiId();

        // Validate edit request using the base controller's method
        $error = $this->validateEditRequest($submission, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        // Get all existing submissions for year selector
        $existingSubmissions = MER1Submission::where('hei_id', $heiId)
            ->with(['educationalAttainments', 'trainings'])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $sub) {
            $existingData[$year] = [
                'id' => $sub->id,
                'academic_year' => $sub->academic_year,
                'status' => $sub->status,
                'hei_name' => $sub->hei_name,
                'hei_code' => $sub->hei_code,
                'hei_type' => $sub->hei_type,
                'hei_address' => $sub->hei_address,
                'sas_head_name' => $sub->sas_head_name,
                'sas_head_position' => $sub->sas_head_position,
                'permanent_status' => $sub->permanent_status,
                'other_achievements' => $sub->other_achievements,
                'educational_attainments' => $sub->educationalAttainments->toArray(),
                'trainings' => $sub->trainings->toArray(),
                'request_notes' => $sub->request_notes,
            ];
        }
        
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER1Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $submission->academic_year,
            'isEditing' => true
        ]);
    }

    /**
     * Cancel a MER1 submission
     */
    public function cancel(Request $request, $submissionId)
    {
        $submission = MER1Submission::findOrFail($submissionId);
        $heiId = $this->getHeiId();

        // Validate ownership and status
        if ($submission->hei_id !== $heiId) {
            return redirect()->back()->withErrors(['error' => 'Unauthorized action.']);
        }

        if ($submission->status !== 'request') {
            return redirect()->back()->withErrors(['error' => 'Only pending requests can be cancelled.']);
        }

        $validated = $request->validate([
            'cancelled_notes' => 'nullable|string|max:1000'
        ]);

        $submission->update([
            'status' => 'cancelled',
            'cancelled_notes' => $validated['cancelled_notes'] ?? null,
        ]);

        // Clear caches
        $this->clearSubmissionCaches($heiId, $submission->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'MER1 request cancelled successfully.');
    }
}
