<?php

namespace App\Http\Controllers\HEI;

use App\Models\MER3Submission;
use App\Models\MER3SchoolFee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MER3Controller extends BaseAnnexController
{
    /**
     * Show the MER3 creation/edit form
     */
    public function create()
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();
        
        // Get all existing submissions for this HEI with related school fees data
        $existingSubmissions = MER3Submission::where('hei_id', $heiId)
            ->with('schoolFees')
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $submission) {
            $existingData[$year] = [
                'id' => $submission->id,
                'academic_year' => $submission->academic_year,
                'status' => $submission->status,
                
                // School fees table data
                'school_fees' => $submission->schoolFees->toArray(),
                
                'request_notes' => $submission->request_notes,
            ];
        }
        
        // Ensure existingData is always an object (not an array) for JavaScript
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER3Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $this->getCurrentAcademicYear(),
        ]);
    }

    /**
     * Store or update MER3 submission
     */
    public function store(Request $request)
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            
            // School fees array
            'school_fees' => 'nullable|array',
            'school_fees.*.name_of_school_fees' => 'nullable|string|max:255',
            'school_fees.*.description' => 'nullable|string|max:1000',
            'school_fees.*.amount' => 'nullable|numeric|min:0',
            'school_fees.*.remarks' => 'nullable|string|max:500',
            
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate academic year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        // Check for existing submission
        $existingSubmission = MER3Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        // Determine new status and message
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'MER3');

        DB::beginTransaction();
        try {
            // If overwriting existing, mark old as overwritten
            if ($existingSubmission) {
                $this->overwriteExisting(MER3Submission::class, $heiId, $academicYear, $existingSubmission->status);
            }
            
            // Create new submission
            $submission = MER3Submission::create([
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
                'status' => $newStatus,
                'request_notes' => $validated['request_notes'] ?? null,
            ]);

            // Save school fees data
            $this->saveSchoolFees($submission, $validated['school_fees'] ?? []);

            DB::commit();

            // Clear caches
            $this->clearSubmissionCaches($heiId, $academicYear);

            return redirect()->route('hei.submissions.history')->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('MER3 submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
            ]);
            
            // Return the actual error message for debugging
            $errorMessage = config('app.debug') 
                ? 'Failed to save MER3 submission: ' . $e->getMessage()
                : 'Failed to save MER3 submission. Please try again.';
            
            return redirect()->back()->withErrors(['error' => $errorMessage])->withInput();
        }
    }

    /**
     * Helper: Save school fees records
     */
    private function saveSchoolFees($submission, $schoolFeesArray)
    {
        if (empty($schoolFeesArray)) {
            return;
        }

        foreach ($schoolFeesArray as $fee) {
            // Only save if at least name is filled
            if (!empty($fee['name_of_school_fees'])) {
                $submission->schoolFees()->create([
                    'name_of_school_fees' => $fee['name_of_school_fees'],
                    'description' => $fee['description'] ?? null,
                    'amount' => $fee['amount'] ?? null,
                    'remarks' => $fee['remarks'] ?? null,
                ]);
            }
        }
    }

    /**
     * Get MER3 data for a specific year (AJAX endpoint)
     */
    public function getData($academicYear)
    {
        $heiId = $this->getHeiId();
        
        $submission = MER3Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->with('schoolFees')
            ->first();

        if (!$submission) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $submission->id,
            'academic_year' => $submission->academic_year,
            'status' => $submission->status,
            'school_fees' => $submission->schoolFees,
        ]);
    }

    /**
     * Edit an existing MER3 submission
     */
    public function edit($submissionId)
    {
        $submission = MER3Submission::findOrFail($submissionId);
        $heiId = $this->getHeiId();

        // Validate edit request using the base controller's method
        $error = $this->validateEditRequest($submission, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        // Get all existing submissions for year selector
        $existingSubmissions = MER3Submission::where('hei_id', $heiId)
            ->with('schoolFees')
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $sub) {
            $existingData[$year] = [
                'id' => $sub->id,
                'academic_year' => $sub->academic_year,
                'status' => $sub->status,
                'school_fees' => $sub->schoolFees->toArray(),
                'request_notes' => $sub->request_notes,
            ];
        }
        
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER3Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $submission->academic_year,
            'isEditing' => true
        ]);
    }

    /**
     * Cancel a MER3 submission
     */
    public function cancel(Request $request, $submissionId)
    {
        $submission = MER3Submission::findOrFail($submissionId);
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

        return redirect()->route('hei.submissions.history')->with('success', 'MER3 request cancelled successfully.');
    }
}
