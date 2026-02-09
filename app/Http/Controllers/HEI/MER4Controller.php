<?php

namespace App\Http\Controllers\HEI;

use App\Models\MER4Submission;
use App\Models\MER4SASManagementItem;
use App\Models\MER4GuidanceCounselingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MER4Controller extends BaseAnnexController
{
    /**
     * Show the MER4 creation/edit form
     */
    public function create()
    {
        $heiId = $this->getHeiId();
        
        // Get all existing submissions for this HEI with related data
        $existingSubmissions = MER4Submission::where('hei_id', $heiId)
            ->with(['sasManagementItems', 'guidanceCounselingItems'])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $submission) {
            $existingData[$year] = [
                'id' => $submission->id,
                'academic_year' => $submission->academic_year,
                'status' => $submission->status,
                'sas_management_items' => $submission->sasManagementItems->toArray(),
                'guidance_counseling_items' => $submission->guidanceCounselingItems->toArray(),
                'request_notes' => $submission->request_notes,
            ];
        }
        
        // Ensure existingData is always an object (not an array) for JavaScript
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER4Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $this->getCurrentAcademicYear(),
        ]);
    }

    /**
     * Store or update MER4 submission
     */
    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            
            // SAS Management Items
            'sas_management_items' => 'required|array',
            'sas_management_items.*.id' => 'required|string',
            'sas_management_items.*.requirement' => 'required|string',
            'sas_management_items.*.evidence_file' => 'nullable|string', // JSON string
            'sas_management_items.*.status_compiled' => 'boolean',
            'sas_management_items.*.hei_remarks' => 'nullable|string',
            
            // Guidance Counseling Items
            'guidance_counseling_items' => 'required|array',
            'guidance_counseling_items.*.id' => 'required|string',
            'guidance_counseling_items.*.requirement' => 'required|string',
            'guidance_counseling_items.*.evidence_file' => 'nullable|string', // JSON string
            'guidance_counseling_items.*.status_compiled' => 'boolean',
            'guidance_counseling_items.*.hei_remarks' => 'nullable|string',
            
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate academic year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        // Check for existing submission
        $existingSubmission = MER4Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        // Determine new status and message
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'MER4');

        DB::beginTransaction();
        try {
            // If overwriting existing, mark old as overwritten
            if ($existingSubmission) {
                $this->overwriteExisting(MER4Submission::class, $heiId, $academicYear, $existingSubmission->status);
            }
            
            // Create new submission
            $submission = MER4Submission::create([
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
                'status' => $newStatus,
                'request_notes' => $validated['request_notes'] ?? null,
            ]);

            // Save SAS Management Items
            foreach ($validated['sas_management_items'] as $item) {
                $submission->sasManagementItems()->create([
                    'row_id' => $item['id'],
                    'requirement' => $item['requirement'],
                    'evidence_file' => $item['evidence_file'], // Already JSON string from frontend
                    'status_compiled' => $item['status_compiled'] ?? false,
                    'hei_remarks' => $item['hei_remarks'] ?? null,
                ]);
            }

            // Save Guidance Counseling Items
            foreach ($validated['guidance_counseling_items'] as $item) {
                $submission->guidanceCounselingItems()->create([
                    'row_id' => $item['id'],
                    'requirement' => $item['requirement'],
                    'evidence_file' => $item['evidence_file'], // Already JSON string from frontend
                    'status_compiled' => $item['status_compiled'] ?? false,
                    'hei_remarks' => $item['hei_remarks'] ?? null,
                ]);
            }

            DB::commit();

            // Clear caches
            $this->clearSubmissionCaches($heiId, $academicYear);

            return redirect()->route('hei.submissions.history')->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('MER4 submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
            ]);
            
            // Return the actual error message for debugging
            $errorMessage = config('app.debug') 
                ? 'Failed to save MER4 submission: ' . $e->getMessage()
                : 'Failed to save MER4 submission. Please try again.';
            
            return redirect()->back()->withErrors(['error' => $errorMessage])->withInput();
        }
    }

    /**
     * Get MER4 data for a specific year (AJAX endpoint)
     */
    public function getData($academicYear)
    {
        $heiId = $this->getHeiId();
        
        $submission = MER4Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->with(['sasManagementItems', 'guidanceCounselingItems'])
            ->first();

        if (!$submission) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $submission->id,
            'academic_year' => $submission->academic_year,
            'status' => $submission->status,
            'sas_management_items' => $submission->sasManagementItems,
            'guidance_counseling_items' => $submission->guidanceCounselingItems,
        ]);
    }

    /**
     * Edit an existing MER4 submission
     */
    public function edit($submissionId)
    {
        $submission = MER4Submission::findOrFail($submissionId);
        $heiId = $this->getHeiId();

        // Validate edit request using the base controller's method
        $error = $this->validateEditRequest($submission, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        // Get all existing submissions for year selector
        $existingSubmissions = MER4Submission::where('hei_id', $heiId)
            ->with(['sasManagementItems', 'guidanceCounselingItems'])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $sub) {
            $existingData[$year] = [
                'id' => $sub->id,
                'academic_year' => $sub->academic_year,
                'status' => $sub->status,
                'sas_management_items' => $sub->sasManagementItems->toArray(),
                'guidance_counseling_items' => $sub->guidanceCounselingItems->toArray(),
                'request_notes' => $sub->request_notes,
            ];
        }
        
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER4Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $submission->academic_year,
            'isEditing' => true
        ]);
    }

    /**
     * Cancel a MER4 submission
     */
    public function cancel(Request $request, $submissionId)
    {
        $submission = MER4Submission::findOrFail($submissionId);
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

        return redirect()->route('hei.submissions.history')->with('success', 'MER4 request cancelled successfully.');
    }
}
