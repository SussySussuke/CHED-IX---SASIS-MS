<?php

namespace App\Services;

use App\Models\HEI;
use App\Models\CHEDRemark;
use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexCBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexDSubmission;
use App\Models\AnnexEBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexGSubmission;
use App\Models\AnnexHBatch;
use App\Models\AnnexIBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexLBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexMBatch;
use App\Models\AnnexNBatch;
use App\Models\AnnexN1Batch;
use App\Models\AnnexOBatch;

class MER4FormBuilder
{
    /**
     * Build MER4 form dynamically from config
     * This method is configuration-driven - it reads from config/mer4_forms.php
     * and config/annex_metadata.php to build the form structure
     */
    private function buildFormFromConfig($formNumber, $heiId, $academicYear)
    {
        $hei = HEI::findOrFail($heiId);
        $annexLetters = config("mer_forms.{$formNumber}");

        $services = [];

        foreach ($annexLetters as $letter) {
            $metadata = config("annex_metadata.{$letter}");
            
            if (!$metadata) {
                throw new \Exception("No metadata found for Annex {$letter} in config/annex_metadata.php");
            }

            $services[] = [
                'service_name' => "{$metadata['serviceNumber']}. {$metadata['name']}",
                'annex_type' => $metadata['annexType'],
                'rows' => $this->getAnnexRows($metadata['annexType'], $heiId, $academicYear),
            ];
        }

        // Ensure each service has at least one empty row if no data
        foreach ($services as &$service) {
            if (empty($service['rows'])) {
                $service['rows'] = [[
                    'id' => null,
                    'batch_id' => null,
                    'face_to_face' => false,
                    'online' => false,
                    'hei_remarks' => null,
                    'ched_remark' => null,
                    'ched_remark_id' => null,
                    'is_missing' => true,
                ]];
            }
        }

        return [
            'success' => true,
            'data' => [
                'hei' => $hei,
                'academic_year' => $academicYear,
                'services' => $services,
            ],
        ];
    }

    /**
     * Build Form 1: Student Welfare Services (Annexes A-D)
     */
    public function buildForm1($heiId, $academicYear)
    {
        return $this->buildFormFromConfig(1, $heiId, $academicYear);
    }

    /**
     * Build Form 2: Student Welfare Services (Annexes E-G)
     */
    public function buildForm2($heiId, $academicYear)
    {
        return $this->buildFormFromConfig(2, $heiId, $academicYear);
    }

    /**
     * Build Form 3: Institutional Student Programs and Services (Annexes H-O)
     */
    public function buildForm3($heiId, $academicYear)
    {
        return $this->buildFormFromConfig(3, $heiId, $academicYear);
    }

    /**
     * Generic method to get rows for any annex type
     * Routes to the appropriate specific method based on annex type
     */
    private function getAnnexRows($annexType, $heiId, $academicYear)
    {
        $methodMap = [
            'annex_a' => 'getAnnexARows',
            'annex_b' => 'getAnnexBRows',
            'annex_c' => 'getAnnexCRows',
            'annex_c_1' => 'getAnnexC1Rows',
            'annex_d' => 'getAnnexDRows',
            'annex_e' => 'getAnnexERows',
            'annex_f' => 'getAnnexFRows',
            'annex_g' => 'getAnnexGRows',
            'annex_h' => 'getAnnexHRows',
            'annex_i' => 'getAnnexIRows',
            'annex_i_1' => 'getAnnexI1Rows',
            'annex_j' => 'getAnnexJRows',
            'annex_k' => 'getAnnexKRows',
            'annex_l' => 'getAnnexLRows',
            'annex_l_1' => 'getAnnexL1Rows',
            'annex_m' => 'getAnnexMRows',
            'annex_n' => 'getAnnexNRows',
            'annex_n_1' => 'getAnnexN1Rows',
            'annex_o' => 'getAnnexORows',
        ];

        $method = $methodMap[$annexType] ?? null;

        if (!$method || !method_exists($this, $method)) {
            throw new \Exception("No handler method found for annex type: {$annexType}");
        }

        return $this->$method($heiId, $academicYear);
    }

    // Row fetching methods for each annex

    private function getAnnexARows($heiId, $academicYear)
    {
        $batch = AnnexABatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_a', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title' => $program->title,
                'venue' => $program->venue,
                'implementation_date' => $program->implementation_date,
                'target_group' => $program->target_group,
                'face_to_face' => $program->participants_face_to_face > 0,
                'online' => $program->participants_online > 0,
                'participants_face_to_face' => $program->participants_face_to_face,
                'participants_online' => $program->participants_online,
                'organizer' => $program->organizer,
                'hei_remarks' => $program->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexBRows($heiId, $academicYear)
    {
        $batch = AnnexBBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_b', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title' => $program->title,
                'venue' => $program->venue,
                'implementation_date' => $program->implementation_date,
                'target_group' => $program->target_group,
                'face_to_face' => $program->participants_face_to_face > 0,
                'online' => $program->participants_online > 0,
                'participants_face_to_face' => $program->participants_face_to_face,
                'participants_online' => $program->participants_online,
                'organizer' => $program->organizer,
                'hei_remarks' => $program->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexCRows($heiId, $academicYear)
    {
        $batch = AnnexCBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_c', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title' => $program->title,
                'venue' => $program->venue,
                'implementation_date' => $program->implementation_date,
                'face_to_face' => $program->participants_face_to_face > 0,
                'online' => $program->participants_online > 0,
                'participants_face_to_face' => $program->participants_face_to_face,
                'participants_online' => $program->participants_online,
                'organizer' => $program->organizer,
                'hei_remarks' => $program->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexC1Rows($heiId, $academicYear)
    {
        $batch = AnnexC1Batch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_c_1', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title' => $program->title,
                'venue' => $program->venue,
                'implementation_date' => $program->implementation_date,
                'target_group' => $program->target_group,
                'face_to_face' => $program->participants_face_to_face > 0,
                'online' => $program->participants_online > 0,
                'participants_face_to_face' => $program->participants_face_to_face,
                'participants_online' => $program->participants_online,
                'organizer' => $program->organizer,
                'hei_remarks' => $program->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexDRows($heiId, $academicYear)
    {
        $submission = AnnexDSubmission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$submission) {
            return [];
        }

        $remark = CHEDRemark::getRemarkForRow('annex_d', $submission->id);

        // Build handbook types
        $types = [];
        if ($submission->type_digital) $types[] = 'Digital';
        if ($submission->type_printed) $types[] = 'Printed';
        if ($submission->type_others && $submission->type_others_text) $types[] = $submission->type_others_text;
        $handbookTypes = !empty($types) ? implode(', ', $types) : 'N/A';

        return [
            [
                'id' => $submission->id,
                'batch_id' => $submission->submission_id,
                'version_publication_date' => $submission->version_publication_date,
                'handbook_type' => $handbookTypes,
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
                'face_to_face' => true,
                'online' => true,
                'hei_remarks' => null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ]
        ];
    }

    private function getAnnexERows($heiId, $academicYear)
    {
        $batch = AnnexEBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->organizations) {
            return [];
        }

        return $batch->organizations->map(function ($organization) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_e', $organization->id);

            return [
                'id' => $organization->id,
                'batch_id' => $batch->batch_id,
                'organization_name' => $organization->name_of_accredited,
                'years_of_existence' => $organization->years_of_existence,
                'specialization' => $organization->specialization,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexFRows($heiId, $academicYear)
    {
        $batch = AnnexFBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->activities) {
            return [];
        }

        return $batch->activities->map(function ($activity) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_f', $activity->id);

            return [
                'id' => $activity->id,
                'batch_id' => $batch->batch_id,
                'activity' => $activity->activity,
                'date' => $activity->date,
                'status' => $activity->status,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexGRows($heiId, $academicYear)
    {
        $submission = AnnexGSubmission::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->with(['editorialBoards', 'otherPublications', 'programs'])
            ->latest()
            ->first();

        if (!$submission) {
            return [];
        }

        $remark = CHEDRemark::getRemarkForRow('annex_g', $submission->id);

        // Build frequency string
        $frequencies = [];
        if ($submission->frequency_monthly) $frequencies[] = 'Monthly';
        if ($submission->frequency_quarterly) $frequencies[] = 'Quarterly';
        if ($submission->frequency_annual) $frequencies[] = 'Annual';
        if ($submission->frequency_per_semester) $frequencies[] = 'Per Semester';
        if ($submission->frequency_others && $submission->frequency_others_specify) $frequencies[] = $submission->frequency_others_specify;
        $frequencyText = !empty($frequencies) ? implode(', ', $frequencies) : 'N/A';

        // Build publication type string
        $pubTypes = [];
        if ($submission->publication_type_newsletter) $pubTypes[] = 'Newsletter';
        if ($submission->publication_type_gazette) $pubTypes[] = 'Gazette';
        if ($submission->publication_type_magazine) $pubTypes[] = 'Magazine';
        if ($submission->publication_type_others && $submission->publication_type_others_specify) $pubTypes[] = $submission->publication_type_others_specify;
        $pubTypeText = !empty($pubTypes) ? implode(', ', $pubTypes) : 'N/A';

        return [
            [
                'id' => $submission->id,
                'batch_id' => $submission->submission_id,
                'publication_name' => $submission->student_publication_name,
                'official_school_name' => $submission->official_school_name,
                'student_publication_name' => $submission->student_publication_name,
                'publication_fee_per_student' => $submission->publication_fee_per_student,
                'frequency' => $frequencyText,
                'publication_type' => $pubTypeText,
                'adviser_name' => $submission->adviser_name,
                'adviser_position_designation' => $submission->adviser_position_designation,
                'editorial_boards' => $submission->editorialBoards->toArray(),
                'other_publications' => $submission->otherPublications->toArray(),
                'programs' => $submission->programs->toArray(),
                'face_to_face' => true,
                'online' => true,
                'hei_remarks' => null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ]
        ];
    }

    private function getAnnexHRows($heiId, $academicYear)
    {
        $batch = AnnexHBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->admissionServices) {
            return [];
        }

        return $batch->admissionServices->map(function ($service) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_h', $service->id);

            return [
                'id' => $service->id,
                'batch_id' => $batch->batch_id,
                'service_type' => $service->service_type,
                'with' => $service->with,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $service->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexIRows($heiId, $academicYear)
    {
        $batch = AnnexIBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->scholarships) {
            return [];
        }

        return $batch->scholarships->map(function ($scholarship) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_i', $scholarship->id);

            return [
                'id' => $scholarship->id,
                'batch_id' => $batch->batch_id,
                'scholarship_name' => $scholarship->scholarship_name,
                'beneficiaries' => $scholarship->number_of_beneficiaries ?? 0,
                'face_to_face' => false,
                'online' => false,
                'hei_remarks' => $scholarship->remarks ?? null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexI1Rows($heiId, $academicYear)
    {
        $batch = AnnexI1Batch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->foodServices) {
            return [];
        }

        return $batch->foodServices->map(function ($service) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_i_1', $service->id);

            return [
                'id' => $service->id,
                'batch_id' => $batch->batch_id,
                'service_name' => $service->service_name,
                'service_type' => $service->service_type,
                'operator_name' => $service->operator_name,
                'location' => $service->location,
                'students_served' => $service->number_of_students_served ?? 0,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $service->remarks ?? null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexJRows($heiId, $academicYear)
    {
        $batch = AnnexJBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_j', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title_of_program' => $program->title_of_program,
                'organizer' => $program->organizer,
                'number_of_participants' => $program->number_of_participants,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $program->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexKRows($heiId, $academicYear)
    {
        $batch = AnnexKBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->committees) {
            return [];
        }

        return $batch->committees->map(function ($committee) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_k', $committee->id);

            return [
                'id' => $committee->id,
                'batch_id' => $batch->batch_id,
                'committee_name' => $committee->committee_name ?? $committee->name,
                'face_to_face' => false,
                'online' => false,
                'hei_remarks' => $committee->remarks ?? null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexLRows($heiId, $academicYear)
    {
        $batch = AnnexLBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->housing) {
            return [];
        }

        return $batch->housing->map(function ($house) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_l', $house->id);

            return [
                'id' => $house->id,
                'batch_id' => $batch->batch_id,
                'housing_name' => $house->housing_name,
                'complete_address' => $house->complete_address,
                'house_manager_name' => $house->house_manager_name,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $house->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexL1Rows($heiId, $academicYear)
    {
        $batch = AnnexL1Batch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->internationalServices) {
            return [];
        }

        return $batch->internationalServices->map(function ($service) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_l_1', $service->id);

            return [
                'id' => $service->id,
                'batch_id' => $batch->batch_id,
                'service_name' => $service->service_name,
                'service_type' => $service->service_type,
                'target_nationality' => $service->target_nationality,
                'students_served' => $service->number_of_students_served ?? 0,
                'officer_in_charge' => $service->officer_in_charge,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $service->remarks ?? null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexMRows($heiId, $academicYear)
    {
        $batch = AnnexMBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->services) {
            return [];
        }

        return $batch->services->map(function ($service) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_m', $service->id);

            return [
                'id' => $service->id,
                'batch_id' => $batch->batch_id,
                'section' => $service->section,
                'category' => $service->category,
                'institutional_services_programs_activities' => $service->institutional_services_programs_activities,
                'number_of_beneficiaries_participants' => $service->number_of_beneficiaries_participants,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $service->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexNRows($heiId, $academicYear)
    {
        $batch = AnnexNBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->activities) {
            return [];
        }

        return $batch->activities->map(function ($activity) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_n', $activity->id);

            return [
                'id' => $activity->id,
                'batch_id' => $batch->batch_id,
                'title_of_activity' => $activity->title_of_activity,
                'implementation_date' => $activity->implementation_date,
                'implementation_venue' => $activity->implementation_venue,
                'number_of_participants' => $activity->number_of_participants,
                'organizer' => $activity->organizer,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $activity->remarks,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexN1Rows($heiId, $academicYear)
    {
        $batch = AnnexN1Batch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->sportsPrograms) {
            return [];
        }

        return $batch->sportsPrograms->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_n_1', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'program_title' => $program->program_title,
                'sport_type' => $program->sport_type,
                'implementation_date' => $program->implementation_date,
                'venue' => $program->venue,
                'participants_count' => $program->participants_count ?? 0,
                'organizer' => $program->organizer,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => $program->remarks ?? null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }

    private function getAnnexORows($heiId, $academicYear)
    {
        $batch = AnnexOBatch::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->latest()
            ->first();

        if (!$batch || !$batch->programs) {
            return [];
        }

        return $batch->programs->map(function ($program) use ($batch) {
            $remark = CHEDRemark::getRemarkForRow('annex_o', $program->id);

            return [
                'id' => $program->id,
                'batch_id' => $batch->batch_id,
                'title_of_program' => $program->title_of_program,
                'date_conducted' => $program->date_conducted,
                'number_of_beneficiaries' => $program->number_of_beneficiaries,
                'type_of_community_service' => $program->type_of_community_service,
                'community_population_served' => $program->community_population_served,
                'face_to_face' => true,
                'online' => false,
                'hei_remarks' => null,
                'ched_remark' => $remark?->is_best_practice ?? null,
                'ched_remark_id' => $remark?->id,
            ];
        })->toArray();
    }
}
