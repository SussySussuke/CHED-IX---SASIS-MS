<?php

namespace App\Services\Summary;

use App\Models\HEI;
use App\Models\AnnexHBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexOBatch;
use App\Models\AnnexOProgram;
use App\Models\AnnexEBatch;
use App\Models\AnnexEOrganization;
use App\Models\AnnexNBatch;
use App\Models\AnnexNActivity;
use App\Models\AnnexIBatch;
use App\Models\AnnexIScholarship;
use App\Models\AnnexKBatch;
use App\Models\AnnexLBatch;
use App\Models\AnnexLHousing;
use App\Models\AnnexMBatch;

/**
 * StaticSectionSummaryService
 *
 * Handles all read-only summary sections: Admission, Student Discipline,
 * Social Community, Student Organization, Culture, Scholarship,
 * Safety & Security, Dorm, and Special Needs Stats.
 *
 * These sections have no keyword matching, no category overrides, and no
 * recategorize UI — just straight aggregation + evidence fetches.
 */
class StaticSectionSummaryService
{
    // ── Available years helpers ─────────────────────────────────────────────────

    public function getAdmissionAvailableYears(): array
    {
        return AnnexHBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getStudentDisciplineAvailableYears(): array
    {
        return AnnexFBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getSocialCommunityAvailableYears(): array
    {
        return AnnexOBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getStudentOrganizationAvailableYears(): array
    {
        return AnnexEBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getCultureAvailableYears(): array
    {
        return AnnexNBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getScholarshipAvailableYears(): array
    {
        return AnnexIBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getSafetySecurityAvailableYears(): array
    {
        return AnnexKBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getDormAvailableYears(): array
    {
        return AnnexLBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    public function getSpecialNeedsStatsAvailableYears(): array
    {
        return AnnexMBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')->sort()->values()->toArray();
    }

    // ── Admission (Annex H) ───────────────────────────────────────────────────

    public function getAdmissionRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexHBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('admissionServices')
            ->get()
            ->keyBy('hei_id');

        $fields = [
            'admission_policy', 'pwd_guidelines', 'foreign_guidelines',
            'drug_testing', 'medical_cert', 'online_enrollment', 'entrance_exam',
        ];

        return $heis->map(function ($hei) use ($batches, $fields) {
            $batch = $batches->get($hei->id);

            $row = [
                'hei_id'         => $hei->id,
                'hei_code'       => $hei->code,
                'hei_name'       => $hei->name,
                'hei_type'       => $hei->type,
                'status'         => $batch?->status ?? 'not_submitted',
                'has_submission' => (bool) $batch,
            ];

            foreach ($fields as $f) {
                $row[$f] = null;
            }

            if ($batch) {
                foreach ($batch->admissionServices as $service) {
                    $key = $this->admissionServiceKey($service->service_type);
                    if ($key) {
                        $row[$key] = (bool) $service->with;
                    }
                }
            }

            return $row;
        })->values()->toArray();
    }

    // ── Student Discipline (Annex F) ──────────────────────────────────────────

    public function getStudentDisciplineRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexFBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            return [
                'hei_id'                       => $hei->id,
                'hei_code'                     => $hei->code,
                'hei_name'                     => $hei->name,
                'hei_type'                     => $hei->type,
                'status'                       => $batch?->status ?? 'not_submitted',
                'has_submission'               => (bool) $batch,
                'student_discipline_committee' => $batch ? !empty(trim($batch->student_discipline_committee ?? '')) : null,
                'procedure_mechanism'          => $batch ? !empty(trim($batch->procedure_mechanism ?? '')) : null,
                'complaint_desk'               => $batch ? !empty(trim($batch->complaint_desk ?? '')) : null,
            ];
        })->values()->toArray();
    }

    // ── Social Community / Outreach (Annex O) ─────────────────────────────────

    public function getSocialCommunityRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexOBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch || $batch->programs->isEmpty()) {
                return [
                    'hei_id'             => $hei->id,
                    'hei_code'           => $hei->code,
                    'hei_name'           => $hei->name,
                    'hei_type'           => $hei->type,
                    'status'             => $batch?->status ?? 'not_submitted',
                    'has_submission'     => (bool) $batch,
                    'total_activities'   => $batch ? 0 : null,
                    'total_participants' => $batch ? 0 : null,
                ];
            }

            return [
                'hei_id'             => $hei->id,
                'hei_code'           => $hei->code,
                'hei_name'           => $hei->name,
                'hei_type'           => $hei->type,
                'status'             => $batch->status,
                'has_submission'     => true,
                'total_activities'   => $batch->programs->count(),
                'total_participants' => $batch->programs->sum('number_of_beneficiaries'),
            ];
        })->values()->toArray();
    }

    public function getSocialCommunityEvidence(int $heiId, string $year): array
    {
        return AnnexOProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('date_conducted', 'desc')
         ->get()
         ->map(fn($p) => [
             'id'                          => $p->id,
             'title_of_program'            => $p->title_of_program,
             'date_conducted'              => $p->date_conducted?->format('Y-m-d'),
             'number_of_beneficiaries'     => $p->number_of_beneficiaries ?? 0,
             'type_of_community_service'   => $p->type_of_community_service,
             'community_population_served' => $p->community_population_served,
         ])
         ->values()
         ->toArray();
    }

    // ── Student Organizations (Annex E) ───────────────────────────────────────

    public function getStudentOrganizationRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexEBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('organizations')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'               => $hei->id,
                    'hei_code'             => $hei->code,
                    'hei_name'             => $hei->name,
                    'hei_type'             => $hei->type,
                    'status'               => 'not_submitted',
                    'has_submission'       => false,
                    'total_organizations'  => null,
                    'total_with_activities'=> null,
                ];
            }

            $orgs = $batch->organizations;

            return [
                'hei_id'               => $hei->id,
                'hei_code'             => $hei->code,
                'hei_name'             => $hei->name,
                'hei_type'             => $hei->type,
                'status'               => $batch->status,
                'has_submission'       => true,
                'total_organizations'  => $orgs->count(),
                'total_with_activities'=> $orgs->filter(
                    fn($o) => !empty(trim($o->programs_projects_activities ?? ''))
                )->count(),
            ];
        })->values()->toArray();
    }

    public function getStudentOrganizationEvidence(int $heiId, string $year): array
    {
        return AnnexEOrganization::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('name_of_accredited', 'asc')
         ->get()
         ->map(fn($o) => [
             'id'                           => $o->id,
             'name_of_accredited'           => $o->name_of_accredited,
             'years_of_existence'           => $o->years_of_existence,
             'accredited_since'             => $o->accredited_since,
             'faculty_adviser'              => $o->faculty_adviser,
             'president_and_officers'       => $o->president_and_officers,
             'specialization'               => $o->specialization,
             'fee_collected'                => $o->fee_collected,
             'programs_projects_activities' => $o->programs_projects_activities,
         ])
         ->values()
         ->toArray();
    }

    // ── Culture and the Arts (Annex N) ────────────────────────────────────────

    public function getCultureRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexNBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('activities')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'             => $hei->id,
                    'hei_code'           => $hei->code,
                    'hei_name'           => $hei->name,
                    'hei_type'           => $hei->type,
                    'status'             => 'not_submitted',
                    'has_submission'     => false,
                    'total_activities'   => null,
                    'total_participants' => null,
                ];
            }

            return [
                'hei_id'             => $hei->id,
                'hei_code'           => $hei->code,
                'hei_name'           => $hei->name,
                'hei_type'           => $hei->type,
                'status'             => $batch->status,
                'has_submission'     => true,
                'total_activities'   => $batch->activities->count(),
                'total_participants' => $batch->activities->sum('number_of_participants'),
            ];
        })->values()->toArray();
    }

    public function getCultureEvidence(int $heiId, string $year): array
    {
        return AnnexNActivity::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('implementation_date', 'desc')
         ->get()
         ->map(fn($a) => [
             'id'                   => $a->id,
             'title_of_activity'    => $a->title_of_activity,
             'implementation_date'  => $a->implementation_date?->format('Y-m-d'),
             'implementation_venue' => $a->implementation_venue,
             'total_participants'   => $a->number_of_participants ?? 0,
             'organizer'            => $a->organizer,
             'remarks'              => $a->remarks,
         ])
         ->values()
         ->toArray();
    }

    // ── Scholarships (Annex I) ────────────────────────────────────────────────

    public function getScholarshipRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexIBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('scholarships')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'              => $hei->id,
                    'hei_code'            => $hei->code,
                    'hei_name'            => $hei->name,
                    'hei_type'            => $hei->type,
                    'status'              => 'not_submitted',
                    'has_submission'      => false,
                    'total_scholarships'  => null,
                    'total_beneficiaries' => null,
                ];
            }

            return [
                'hei_id'              => $hei->id,
                'hei_code'            => $hei->code,
                'hei_name'            => $hei->name,
                'hei_type'            => $hei->type,
                'status'              => $batch->status,
                'has_submission'      => true,
                'total_scholarships'  => $batch->scholarships->count(),
                'total_beneficiaries' => $batch->scholarships->sum('number_of_beneficiaries'),
            ];
        })->values()->toArray();
    }

    public function getScholarshipEvidence(int $heiId, string $year): array
    {
        return AnnexIScholarship::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('scholarship_name', 'asc')
         ->get()
         ->map(fn($s) => [
             'id'                              => $s->id,
             'scholarship_name'                => $s->scholarship_name,
             'type'                            => $s->type,
             'category_intended_beneficiaries' => $s->category_intended_beneficiaries,
             'number_of_beneficiaries'         => $s->number_of_beneficiaries,
             'remarks'                         => $s->remarks,
         ])
         ->values()
         ->toArray();
    }

    // ── Safety and Security (Annex K) ─────────────────────────────────────────

    public function getSafetySecurityRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexKBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('committees')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'                      => $hei->id,
                    'hei_code'                    => $hei->code,
                    'hei_name'                    => $hei->name,
                    'hei_type'                    => $hei->type,
                    'status'                      => 'not_submitted',
                    'has_submission'              => false,
                    'safety_security_committee'   => null,
                    'disaster_risk_reduction'     => null,
                    'calamity_management'         => null,
                    'crisis_management_committee' => null,
                    'crisis_psychosocial'         => null,
                    'drug_free_committee'         => null,
                    'drug_education_trained'      => null,
                ];
            }

            $committees = $batch->committees;

            return [
                'hei_id'         => $hei->id,
                'hei_code'       => $hei->code,
                'hei_name'       => $hei->name,
                'hei_type'       => $hei->type,
                'status'         => $batch->status,
                'has_submission' => true,

                'safety_security_committee' => $this->matchCommitteeField(
                    $committees,
                    ['safety and security', 'safety & security', 'safety committee', 'security committee', 'health safety', 'fire safety', 'safety'],
                    ['drug', 'disaster', 'crisis', 'calamity', 'psycho']
                ),
                'disaster_risk_reduction' => $this->matchCommitteeField(
                    $committees,
                    ['disaster risk', 'drrm', 'drr', 'disaster management', 'risk reduction', 'disaster risk reduction']
                ),
                'calamity_management' => $this->matchCommitteeField(
                    $committees,
                    ['calamity management', 'calamity', 'institutional calamity', 'emergency management', 'emergency response team', 'emergency response committee']
                ),
                'crisis_management_committee' => $this->matchCommitteeField(
                    $committees,
                    ['crisis management', 'crisis committee', 'crisis response', 'critical incident', 'incident management'],
                    ['psychosocial', 'psychological']
                ),
                'crisis_psychosocial' => $this->matchCommitteeField(
                    $committees,
                    ['psychosocial', 'psychological support', 'mental health support', 'psychosocial support', 'crisis counseling', 'trauma response', 'crisis psychosocial']
                ),
                'drug_free_committee' => $this->matchCommitteeField(
                    $committees,
                    ['drug-free', 'drug free', 'anti-drug', 'antidrug', 'drug prevention committee', 'drug free committee', 'drug abuse prevention']
                ),
                'drug_education_trained' => $committees->contains(function ($committee) {
                    $name = strtolower($committee->committee_name ?? '');
                    if (!str_contains($name, 'drug')) {
                        return false;
                    }
                    return str_contains($name, 'train')
                        || str_contains($name, 'education')
                        || str_contains($name, 'counselor')
                        || str_contains($name, 'personnel')
                        || str_contains($name, 'preventive');
                }),
            ];
        })->values()->toArray();
    }

    // ── Student Housing / Dormitory (Annex L) ─────────────────────────────────

    public function getDormRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexLBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('housing')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'         => $hei->id,
                    'hei_code'       => $hei->code,
                    'hei_name'       => $hei->name,
                    'hei_type'       => $hei->type,
                    'status'         => 'not_submitted',
                    'has_submission' => false,
                    'total_housing'  => null,
                    'male_count'     => null,
                    'female_count'   => null,
                    'coed_count'     => null,
                ];
            }

            $housing = $batch->housing;

            return [
                'hei_id'         => $hei->id,
                'hei_code'       => $hei->code,
                'hei_name'       => $hei->name,
                'hei_type'       => $hei->type,
                'status'         => $batch->status,
                'has_submission' => true,
                'total_housing'  => $housing->count(),
                'male_count'     => $housing->filter(fn($h) => $h->male && !$h->female && !$h->coed)->count(),
                'female_count'   => $housing->filter(fn($h) => $h->female && !$h->male && !$h->coed)->count(),
                'coed_count'     => $housing->filter(fn($h) => $h->coed)->count(),
            ];
        })->values()->toArray();
    }

    public function getDormEvidence(int $heiId, string $year): array
    {
        return AnnexLHousing::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('housing_name', 'asc')
         ->get()
         ->map(fn($h) => [
             'id'                 => $h->id,
             'housing_name'       => $h->housing_name,
             'complete_address'   => $h->complete_address,
             'house_manager_name' => $h->house_manager_name,
             'type'               => collect([
                 $h->male   ? 'Male'   : null,
                 $h->female ? 'Female' : null,
                 $h->coed   ? 'Co-ed'  : null,
                 (!$h->male && !$h->female && !$h->coed && $h->others) ? $h->others : null,
             ])->filter()->implode(', '),
             'remarks'            => $h->remarks,
         ])
         ->values()
         ->toArray();
    }

    // ── Special Needs / PWD Statistics (Annex M) ──────────────────────────────

    public function getSpecialNeedsStatsRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexMBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with(['statistics' => fn($q) =>
                $q->where('is_subtotal', true)
                  ->where('subcategory', 'Sub-Total')
                  ->whereIn('category', [
                      'A. Persons with Disabilities',
                      'B. Indigenous People',
                      'C. Dependents of Solo Parents / Solo Parents',
                  ])
            ])
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches, $year) {
            $batch = $batches->get($hei->id);

            if (!$batch) {
                return [
                    'hei_id'                 => $hei->id,
                    'hei_code'               => $hei->code,
                    'hei_name'               => $hei->name,
                    'hei_type'               => $hei->type,
                    'status'                 => 'not_submitted',
                    'has_submission'         => false,
                    'pwd_enrollment'         => null,
                    'pwd_graduates'          => null,
                    'ip_enrollment'          => null,
                    'ip_graduates'           => null,
                    'solo_parent_enrollment' => null,
                    'solo_parent_graduates'  => null,
                ];
            }

            $subtotals = $batch->statistics->keyBy('category');

            $extract = function (string $category, string $field) use ($subtotals, $year): int {
                $row = $subtotals->get($category);
                if (!$row || !is_array($row->year_data)) {
                    return 0;
                }
                return intval($row->year_data[$year][$field] ?? 0);
            };

            return [
                'hei_id'                 => $hei->id,
                'hei_code'               => $hei->code,
                'hei_name'               => $hei->name,
                'hei_type'               => $hei->type,
                'status'                 => $batch->status,
                'has_submission'         => true,
                'pwd_enrollment'         => $extract('A. Persons with Disabilities', 'enrollment'),
                'pwd_graduates'          => $extract('A. Persons with Disabilities', 'graduates'),
                'ip_enrollment'          => $extract('B. Indigenous People', 'enrollment'),
                'ip_graduates'           => $extract('B. Indigenous People', 'graduates'),
                'solo_parent_enrollment' => $extract('C. Dependents of Solo Parents / Solo Parents', 'enrollment'),
                'solo_parent_graduates'  => $extract('C. Dependents of Solo Parents / Solo Parents', 'graduates'),
            ];
        })->values()->toArray();
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private function admissionServiceKey(string $serviceType): ?string
    {
        $map = [
            'admission_policy'   => 'General admission',
            'pwd_guidelines'     => 'disabilities',
            'foreign_guidelines' => 'foreign',
            'drug_testing'       => 'Drug testing',
            'medical_cert'       => 'Medical Certificate',
            'online_enrollment'  => 'Online enrolment',
            'entrance_exam'      => 'Entrance examination',
        ];

        foreach ($map as $key => $needle) {
            if (str_contains($serviceType, $needle)) {
                return $key;
            }
        }

        return null;
    }

    private function matchCommitteeField($committees, array $keywords, array $excludeKeywords = []): bool
    {
        return $committees->contains(function ($committee) use ($keywords, $excludeKeywords) {
            $name = strtolower($committee->committee_name ?? '');

            $matched = false;
            foreach ($keywords as $kw) {
                if (str_contains($name, strtolower($kw))) {
                    $matched = true;
                    break;
                }
            }

            if (!$matched) {
                return false;
            }

            foreach ($excludeKeywords as $ex) {
                if (str_contains($name, strtolower($ex))) {
                    return false;
                }
            }

            return true;
        });
    }
}
