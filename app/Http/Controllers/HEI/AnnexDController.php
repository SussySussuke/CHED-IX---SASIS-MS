<?php

namespace App\Http\Controllers\HEI;

use App\Models\AnnexDSubmission;
use Illuminate\Http\Request;

class AnnexDController extends BaseAnnexController
{
    public function create()
    {
        $heiId = $this->getHeiId();

        $existingBatches = AnnexDSubmission::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->get()
            ->map(function ($submission) {
                return [
                    'submission_id' => $submission->submission_id,
                    'academic_year' => $submission->academic_year,
                    'status' => $submission->status,
                    'formData' => [
                        'version_publication_date' => $submission->version_publication_date,
                        'officer_in_charge' => $submission->officer_in_charge,
                        'handbook_committee' => $submission->handbook_committee,
                        'dissemination_orientation' => $submission->dissemination_orientation,
                        'orientation_dates' => $submission->orientation_dates,
                        'mode_of_delivery' => $submission->mode_of_delivery,
                        'dissemination_uploaded' => $submission->dissemination_uploaded,
                        'dissemination_others' => $submission->dissemination_others,
                        'dissemination_others_text' => $submission->dissemination_others_text,
                        'type_digital' => $submission->type_digital,
                        'type_printed' => $submission->type_printed,
                        'type_others' => $submission->type_others,
                        'type_others_text' => $submission->type_others_text,
                        'has_academic_policies' => $submission->has_academic_policies,
                        'has_admission_requirements' => $submission->has_admission_requirements,
                        'has_code_of_conduct' => $submission->has_code_of_conduct,
                        'has_scholarships' => $submission->has_scholarships,
                        'has_student_publication' => $submission->has_student_publication,
                        'has_housing_services' => $submission->has_housing_services,
                        'has_disability_services' => $submission->has_disability_services,
                        'has_student_council' => $submission->has_student_council,
                        'has_refund_policies' => $submission->has_refund_policies,
                        'has_drug_education' => $submission->has_drug_education,
                        'has_foreign_students' => $submission->has_foreign_students,
                        'has_disaster_management' => $submission->has_disaster_management,
                        'has_safe_spaces' => $submission->has_safe_spaces,
                        'has_anti_hazing' => $submission->has_anti_hazing,
                        'has_anti_bullying' => $submission->has_anti_bullying,
                        'has_violence_against_women' => $submission->has_violence_against_women,
                        'has_gender_fair' => $submission->has_gender_fair,
                        'has_others' => $submission->has_others,
                        'has_others_text' => $submission->has_others_text,
                    ],
                    'created_at' => $submission->created_at,
                    'updated_at' => $submission->updated_at,
                ];
            })
            ->keyBy('academic_year');

        return inertia('HEI/Forms/AnnexDCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $existingBatches,
            'defaultYear' => $this->getDefaultYear()
        ]);
    }

    public function store(Request $request)
    {
        $heiId = $this->getHeiId();

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

        $yearError = $this->validateAcademicYear($academicYear);
        if ($yearError) {
            return redirect()->back()->withErrors($yearError)->withInput();
        }

        $existingSubmission = $this->getExistingRecord(AnnexDSubmission::class, $academicYear, $heiId);
        [$newStatus, $message] = $this->determineStatusAndMessage($existingSubmission, 'Annex D');

        if ($existingSubmission) {
            $this->overwriteExisting(AnnexDSubmission::class, $heiId, $academicYear, $existingSubmission->status);
        }

        AnnexDSubmission::create([
            'hei_id' => $heiId,
            'academic_year' => $academicYear,
            'status' => $newStatus,
            ...$validated,
        ]);

        $this->clearSubmissionCaches($heiId, $academicYear);

        return redirect()->route('hei.submissions.history')->with('success', $message);
    }

    public function edit($submissionId)
    {
        $submission = AnnexDSubmission::where('submission_id', $submissionId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateEditRequest($submission, $heiId);
        if ($error) {
            return redirect()->route('hei.submissions.history')->withErrors($error);
        }

        $existingBatches = [
            $submission->academic_year => [
                'submission_id' => $submission->submission_id,
                'academic_year' => $submission->academic_year,
                'status' => $submission->status,
                'formData' => [
                    'version_publication_date' => $submission->version_publication_date,
                    'officer_in_charge' => $submission->officer_in_charge,
                    'handbook_committee' => $submission->handbook_committee,
                    'dissemination_orientation' => $submission->dissemination_orientation,
                    'orientation_dates' => $submission->orientation_dates,
                    'mode_of_delivery' => $submission->mode_of_delivery,
                    'dissemination_uploaded' => $submission->dissemination_uploaded,
                    'dissemination_others' => $submission->dissemination_others,
                    'dissemination_others_text' => $submission->dissemination_others_text,
                    'type_digital' => $submission->type_digital,
                    'type_printed' => $submission->type_printed,
                    'type_others' => $submission->type_others,
                    'type_others_text' => $submission->type_others_text,
                    'has_academic_policies' => $submission->has_academic_policies,
                    'has_admission_requirements' => $submission->has_admission_requirements,
                    'has_code_of_conduct' => $submission->has_code_of_conduct,
                    'has_scholarships' => $submission->has_scholarships,
                    'has_student_publication' => $submission->has_student_publication,
                    'has_housing_services' => $submission->has_housing_services,
                    'has_disability_services' => $submission->has_disability_services,
                    'has_student_council' => $submission->has_student_council,
                    'has_refund_policies' => $submission->has_refund_policies,
                    'has_drug_education' => $submission->has_drug_education,
                    'has_foreign_students' => $submission->has_foreign_students,
                    'has_disaster_management' => $submission->has_disaster_management,
                    'has_safe_spaces' => $submission->has_safe_spaces,
                    'has_anti_hazing' => $submission->has_anti_hazing,
                    'has_anti_bullying' => $submission->has_anti_bullying,
                    'has_violence_against_women' => $submission->has_violence_against_women,
                    'has_gender_fair' => $submission->has_gender_fair,
                    'has_others' => $submission->has_others,
                    'has_others_text' => $submission->has_others_text,
                ],
                'created_at' => $submission->created_at,
                'updated_at' => $submission->updated_at,
            ]
        ];

        return inertia('HEI/Forms/AnnexDCreate', [
            'availableYears' => $this->getAvailableYears(),
            'existingBatches' => $existingBatches,
            'defaultYear' => $submission->academic_year,
            'isEditing' => true
        ]);
    }

    public function cancel(Request $request, $submissionId)
    {
        $submission = AnnexDSubmission::where('submission_id', $submissionId)->first();
        $heiId = $this->getHeiId();

        $error = $this->validateCancelRequest($submission, $heiId);
        if ($error) {
            return redirect()->back()->withErrors($error);
        }

        $validated = $request->validate([
            'cancelled_notes' => 'nullable|string|max:1000'
        ]);

        $submission->update([
            'status' => 'cancelled',
            'cancelled_notes' => $validated['cancelled_notes'] ?? null,
        ]);

        $this->clearSubmissionCaches($heiId, $submission->academic_year);

        return redirect()->route('hei.submissions.history')->with('success', 'Request cancelled successfully.');
    }
}
