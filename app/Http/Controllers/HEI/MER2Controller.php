<?php

namespace App\Http\Controllers\HEI;

use App\Models\MER2Submission;
use App\Models\MER2Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MER2Controller extends BaseAnnexController
{
    /**
     * Show the MER2 creation/edit form
     */
    public function create()
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();
        
        // Get all existing submissions for this HEI with related personnel data
        $existingSubmissions = MER2Submission::where('hei_id', $heiId)
            ->with([
                'officeStudentAffairsPersonnel',
                'guidanceOfficePersonnel',
                'careerDevCenterPersonnel',
                'studentDevWelfarePersonnel'
            ])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $submission) {
            $existingData[$year] = [
                'id' => $submission->id,
                'academic_year' => $submission->academic_year,
                'status' => $submission->status,
                
                // Student counts (manual input fields)
                'office_student_affairs_students_handled' => $submission->office_student_affairs_students_handled,
                'guidance_office_students_handled' => $submission->guidance_office_students_handled,
                'career_dev_center_students_handled' => $submission->career_dev_center_students_handled,
                'student_dev_welfare_students_handled' => $submission->student_dev_welfare_students_handled,
                
                // Personnel tables
                'office_student_affairs_personnel' => $submission->officeStudentAffairsPersonnel->toArray(),
                'guidance_office_personnel' => $submission->guidanceOfficePersonnel->toArray(),
                'career_dev_center_personnel' => $submission->careerDevCenterPersonnel->toArray(),
                'student_dev_welfare_personnel' => $submission->studentDevWelfarePersonnel->toArray(),
                
                'request_notes' => $submission->request_notes,
            ];
        }
        
        // Ensure existingData is always an object (not an array) for JavaScript
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER2Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $this->getCurrentAcademicYear(),
        ]);
    }

    /**
     * Store or update MER2 submission
     */
    public function store(Request $request)
    {
        $hei = auth()->user()->hei;
        $heiId = $this->getHeiId();

        $validated = $request->validate([
            'academic_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            
            // Student counts (manual input)
            'office_student_affairs_students_handled' => 'nullable|integer|min:0',
            'guidance_office_students_handled' => 'nullable|integer|min:0',
            'career_dev_center_students_handled' => 'nullable|integer|min:0',
            'student_dev_welfare_students_handled' => 'nullable|integer|min:0',
            
            // Personnel arrays for each office
            'office_student_affairs_personnel' => 'nullable|array',
            'office_student_affairs_personnel.*.name_of_personnel' => 'nullable|string|max:255',
            'office_student_affairs_personnel.*.position_designation' => 'nullable|string|max:255',
            'office_student_affairs_personnel.*.tenure_nature_of_appointment' => 'nullable|string|max:255',
            'office_student_affairs_personnel.*.years_in_office' => 'nullable|integer|min:0',
            'office_student_affairs_personnel.*.qualification_highest_degree' => 'nullable|string|max:255',
            'office_student_affairs_personnel.*.license_no_type' => 'nullable|string|max:255',
            'office_student_affairs_personnel.*.license_expiry_date' => 'nullable|date',
            
            'guidance_office_personnel' => 'nullable|array',
            'guidance_office_personnel.*.name_of_personnel' => 'nullable|string|max:255',
            'guidance_office_personnel.*.position_designation' => 'nullable|string|max:255',
            'guidance_office_personnel.*.tenure_nature_of_appointment' => 'nullable|string|max:255',
            'guidance_office_personnel.*.years_in_office' => 'nullable|integer|min:0',
            'guidance_office_personnel.*.qualification_highest_degree' => 'nullable|string|max:255',
            'guidance_office_personnel.*.license_no_type' => 'nullable|string|max:255',
            'guidance_office_personnel.*.license_expiry_date' => 'nullable|date',
            
            'career_dev_center_personnel' => 'nullable|array',
            'career_dev_center_personnel.*.name_of_personnel' => 'nullable|string|max:255',
            'career_dev_center_personnel.*.position_designation' => 'nullable|string|max:255',
            'career_dev_center_personnel.*.tenure_nature_of_appointment' => 'nullable|string|max:255',
            'career_dev_center_personnel.*.years_in_office' => 'nullable|integer|min:0',
            'career_dev_center_personnel.*.qualification_highest_degree' => 'nullable|string|max:255',
            'career_dev_center_personnel.*.license_no_type' => 'nullable|string|max:255',
            'career_dev_center_personnel.*.license_expiry_date' => 'nullable|date',
            
            'student_dev_welfare_personnel' => 'nullable|array',
            'student_dev_welfare_personnel.*.name_of_personnel' => 'nullable|string|max:255',
            'student_dev_welfare_personnel.*.position_designation' => 'nullable|string|max:255',
            'student_dev_welfare_personnel.*.tenure_nature_of_appointment' => 'nullable|string|max:255',
            'student_dev_welfare_personnel.*.years_in_office' => 'nullable|integer|min:0',
            'student_dev_welfare_personnel.*.qualification_highest_degree' => 'nullable|string|max:255',
            'student_dev_welfare_personnel.*.license_no_type' => 'nullable|string|max:255',
            'student_dev_welfare_personnel.*.license_expiry_date' => 'nullable|date',
            
            'request_notes' => 'nullable|string|max:1000',
        ]);

        $academicYear = $validated['academic_year'];

        // Validate academic year is not in the future
        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        // Check for existing submission
        $existingSubmission = MER2Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        // Determine new status and message
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'MER2');

        DB::beginTransaction();
        try {
            // If overwriting existing, mark old as overwritten
            if ($existingSubmission) {
                $this->overwriteExisting(MER2Submission::class, $heiId, $academicYear, $existingSubmission->status);
            }
            
            // Create new submission
            $submission = MER2Submission::create([
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
                'status' => $newStatus,
                
                // Student counts
                'office_student_affairs_students_handled' => $validated['office_student_affairs_students_handled'] ?? null,
                'guidance_office_students_handled' => $validated['guidance_office_students_handled'] ?? null,
                'career_dev_center_students_handled' => $validated['career_dev_center_students_handled'] ?? null,
                'student_dev_welfare_students_handled' => $validated['student_dev_welfare_students_handled'] ?? null,
                
                'request_notes' => $validated['request_notes'] ?? null,
            ]);

            // Save personnel for each office type
            $this->savePersonnelForOffice(
                $submission, 
                MER2Personnel::OFFICE_STUDENT_AFFAIRS, 
                $validated['office_student_affairs_personnel'] ?? []
            );
            
            $this->savePersonnelForOffice(
                $submission, 
                MER2Personnel::GUIDANCE_OFFICE, 
                $validated['guidance_office_personnel'] ?? []
            );
            
            $this->savePersonnelForOffice(
                $submission, 
                MER2Personnel::CAREER_DEV_CENTER, 
                $validated['career_dev_center_personnel'] ?? []
            );
            
            $this->savePersonnelForOffice(
                $submission, 
                MER2Personnel::STUDENT_DEV_WELFARE, 
                $validated['student_dev_welfare_personnel'] ?? []
            );

            DB::commit();

            // Clear caches
            $this->clearSubmissionCaches($heiId, $academicYear);

            return redirect()->route('hei.submissions.history')->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('MER2 submission error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'hei_id' => $heiId,
                'academic_year' => $academicYear,
            ]);
            
            // Return the actual error message for debugging
            $errorMessage = config('app.debug') 
                ? 'Failed to save MER2 submission: ' . $e->getMessage()
                : 'Failed to save MER2 submission. Please try again.';
            
            return redirect()->back()->withErrors(['error' => $errorMessage])->withInput();
        }
    }

    /**
     * Helper: Save personnel records for a specific office type
     */
    private function savePersonnelForOffice($submission, $officeType, $personnelArray)
    {
        if (empty($personnelArray)) {
            return;
        }

        foreach ($personnelArray as $personnel) {
            // Only save if at least name is filled
            if (!empty($personnel['name_of_personnel'])) {
                $submission->personnel()->create([
                    'office_type' => $officeType,
                    'name_of_personnel' => $personnel['name_of_personnel'],
                    'position_designation' => $personnel['position_designation'] ?? null,
                    'tenure_nature_of_appointment' => $personnel['tenure_nature_of_appointment'] ?? null,
                    'years_in_office' => $personnel['years_in_office'] ?? null,
                    'qualification_highest_degree' => $personnel['qualification_highest_degree'] ?? null,
                    'license_no_type' => $personnel['license_no_type'] ?? null,
                    'license_expiry_date' => $personnel['license_expiry_date'] ?? null,
                ]);
            }
        }
    }

    /**
     * Get MER2 data for a specific year (AJAX endpoint)
     */
    public function getData($academicYear)
    {
        $heiId = $this->getHeiId();
        
        $submission = MER2Submission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->with([
                'officeStudentAffairsPersonnel',
                'guidanceOfficePersonnel',
                'careerDevCenterPersonnel',
                'studentDevWelfarePersonnel'
            ])
            ->first();

        if (!$submission) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $submission->id,
            'academic_year' => $submission->academic_year,
            'status' => $submission->status,
            'office_student_affairs_students_handled' => $submission->office_student_affairs_students_handled,
            'guidance_office_students_handled' => $submission->guidance_office_students_handled,
            'career_dev_center_students_handled' => $submission->career_dev_center_students_handled,
            'student_dev_welfare_students_handled' => $submission->student_dev_welfare_students_handled,
            'office_student_affairs_personnel' => $submission->officeStudentAffairsPersonnel,
            'guidance_office_personnel' => $submission->guidanceOfficePersonnel,
            'career_dev_center_personnel' => $submission->careerDevCenterPersonnel,
            'student_dev_welfare_personnel' => $submission->studentDevWelfarePersonnel,
        ]);
    }

    /**
     * Edit an existing MER2 submission
     */
    public function edit($submissionId)
    {
        $submission = MER2Submission::findOrFail($submissionId);
        $heiId = $this->getHeiId();

        // Validate edit request using the base controller's method
        $error = $this->validateEditRequest($submission, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        // Get all existing submissions for year selector
        $existingSubmissions = MER2Submission::where('hei_id', $heiId)
            ->with([
                'officeStudentAffairsPersonnel',
                'guidanceOfficePersonnel',
                'careerDevCenterPersonnel',
                'studentDevWelfarePersonnel'
            ])
            ->get()
            ->keyBy('academic_year');
        
        // Transform to match frontend expectations
        $existingData = [];
        foreach ($existingSubmissions as $year => $sub) {
            $existingData[$year] = [
                'id' => $sub->id,
                'academic_year' => $sub->academic_year,
                'status' => $sub->status,
                'office_student_affairs_students_handled' => $sub->office_student_affairs_students_handled,
                'guidance_office_students_handled' => $sub->guidance_office_students_handled,
                'career_dev_center_students_handled' => $sub->career_dev_center_students_handled,
                'student_dev_welfare_students_handled' => $sub->student_dev_welfare_students_handled,
                'office_student_affairs_personnel' => $sub->officeStudentAffairsPersonnel->toArray(),
                'guidance_office_personnel' => $sub->guidanceOfficePersonnel->toArray(),
                'career_dev_center_personnel' => $sub->careerDevCenterPersonnel->toArray(),
                'student_dev_welfare_personnel' => $sub->studentDevWelfarePersonnel->toArray(),
                'request_notes' => $sub->request_notes,
            ];
        }
        
        if (empty($existingData)) {
            $existingData = new \stdClass();
        }

        return inertia('HEI/Forms/MER2Create', [
            'availableYears' => $this->getAvailableYears(),
            'existingData' => $existingData,
            'defaultYear' => $submission->academic_year,
            'isEditing' => true
        ]);
    }

    /**
     * Cancel a MER2 submission
     */
    public function cancel(Request $request, $submissionId)
    {
        $submission = MER2Submission::findOrFail($submissionId);
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

        return redirect()->route('hei.submissions.history')->with('success', 'MER2 request cancelled successfully.');
    }
}
