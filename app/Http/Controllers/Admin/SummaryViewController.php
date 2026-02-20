<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Summary;
use App\Models\HEI;
use App\Models\AnnexABatch;
use App\Models\AnnexAProgram;
use App\Models\AnnexBBatch;
use App\Models\AnnexBProgram;
use App\Models\ProgramCategoryOverride;
use App\Models\MER2Submission;
use App\Models\MER1Submission;
use App\Models\PersonnelCategoryOverride;
use App\Models\GuidanceCounsellingCategoryOverride;
use App\Models\CareerJobCategoryOverride;
use App\Models\AnnexCBatch;
use App\Models\AnnexCProgram;
use App\Models\HealthCategoryOverride;
use App\Models\AnnexJBatch;
use App\Models\AnnexJProgram;
use App\Models\AnnexHBatch;
use App\Models\AnnexHAdmissionService;
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
use App\Models\AnnexKCommittee;
use App\Models\AnnexLBatch;
use App\Models\AnnexLHousing;
use App\Models\AnnexMBatch;
use App\Models\AnnexMStatistic;
use Illuminate\Http\Request;

class SummaryViewController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // Keyword map — shared by aggregation and evidence methods
    // ──────────────────────────────────────────────────────────────────────────

    private const CATEGORY_KEYWORDS = [
        'campus_orientation' => [
            'orientation', 'freshmen', 'freshman', 'new student', 'welcome', 'induction',
        ],
        'gender_sensitivity' => [
            'gender', 'vawc', 'women', 'harassment', 'sensitivity', 'safe space',
        ],
        'anti_hazing' => [
            'hazing', 'anti-hazing', 'bullying', 'fraternity',
        ],
        'substance_abuse' => [
            'substance', 'drug', 'alcohol', 'tobacco', 'smoking', 'vape', 'vaping',
        ],
        'sexual_health' => [
            'sexual', 'reproductive', 'hiv', 'aids', 'std', 'sti', 'pregnancy',
        ],
        'mental_health' => [
            'mental', 'wellness', 'well-being', 'wellbeing', 'counseling',
            'stress', 'anxiety', 'depression', 'psychological',
        ],
        'disaster_risk' => [
            'disaster', 'earthquake', 'fire drill', 'emergency',
            'evacuation', 'preparedness', 'risk reduction',
        ],
    ];

    /**
     * Returns all categories that match the given search text.
     * An empty array means the program is uncategorized.
     */
    private function matchCategories(string $searchText): array
    {
        $matched = [];

        foreach (self::CATEGORY_KEYWORDS as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($searchText, $keyword)) {
                    $matched[] = $category;
                    break; // one keyword match is enough per category
                }
            }
        }

        return $matched;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Summary index (Profile / Personnel data)
    // ──────────────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = Summary::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values()
            ->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $summaries = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $summaryData = Summary::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->get()
                ->keyBy('hei_id');

            $summaries = $heis->map(function ($hei) use ($summaryData, $selectedYear) {
                $summary = $summaryData->get($hei->id);

                if ($summary) {
                    return [
                        'id'                   => $summary->id,
                        'hei_id'               => $hei->id,
                        'hei_code'             => $hei->code,
                        'hei_name'             => $hei->name,
                        'hei_type'             => $hei->type,
                        'academic_year'        => $summary->academic_year,
                        'population_male'      => $summary->population_male,
                        'population_female'    => $summary->population_female,
                        'population_intersex'  => $summary->population_intersex,
                        'population_total'     => $summary->population_total,
                        'submitted_org_chart'  => $summary->submitted_org_chart,
                        'hei_website'          => $summary->hei_website,
                        'sas_website'          => $summary->sas_website,
                        'social_media_contacts'=> $summary->social_media_contacts
                            ? implode(', ', $summary->social_media_contacts)
                            : '',
                        'student_handbook'     => $summary->student_handbook,
                        'student_publication'  => $summary->student_publication,
                        'status'               => $summary->status,
                        'submitted_at'         => $summary->created_at->format('Y-m-d H:i:s'),
                        'has_submission'       => true,
                    ];
                }

                return [
                    'id'                   => null,
                    'hei_id'               => $hei->id,
                    'hei_code'             => $hei->code,
                    'hei_name'             => $hei->name,
                    'hei_type'             => $hei->type,
                    'academic_year'        => $selectedYear,
                    'population_male'      => null,
                    'population_female'    => null,
                    'population_intersex'  => null,
                    'population_total'     => null,
                    'submitted_org_chart'  => null,
                    'hei_website'          => null,
                    'sas_website'          => null,
                    'social_media_contacts'=> '',
                    'student_handbook'     => null,
                    'student_publication'  => null,
                    'status'               => 'not_submitted',
                    'submitted_at'         => null,
                    'has_submission'       => false,
                ];
            })->toArray();
        }

        return inertia('Admin/SummaryView', [
            'summaries'      => $summaries,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Info-Orientation aggregated data
    // ──────────────────────────────────────────────────────────────────────────

    public function getInfoOrientationData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexABatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->merge(
                AnnexBBatch::whereIn('status', ['published', 'submitted', 'request'])
                    ->distinct()->pluck('academic_year')
            )
            ->unique()->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $annexABatches = AnnexABatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $annexBBatches = AnnexBBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($annexABatches, $annexBBatches, $selectedYear) {
                $batchA = $annexABatches->get($hei->id);
                $batchB = $annexBBatches->get($hei->id);

                $allPrograms = collect();
                if ($batchA) $allPrograms = $allPrograms->merge($batchA->programs->map(fn($p) => [$p, 'annex_a']));
                if ($batchB) $allPrograms = $allPrograms->merge($batchB->programs->map(fn($p) => [$p, 'annex_b']));

                if ($allPrograms->isEmpty()) {
                    return $this->emptyHeiRow($hei, $selectedYear);
                }

                // Fetch overrides for all programs in this HEI batch
                $programIds = [
                    'annex_a' => $batchA ? $batchA->programs->pluck('id')->toArray() : [],
                    'annex_b' => $batchB ? $batchB->programs->pluck('id')->toArray() : [],
                ];

                $overrides = ProgramCategoryOverride::where(function ($q) use ($programIds) {
                    foreach ($programIds as $type => $ids) {
                        if (!empty($ids)) {
                            $q->orWhere(function ($q2) use ($type, $ids) {
                                $q2->where('program_type', $type)->whereIn('program_id', $ids);
                            });
                        }
                    }
                })->get()->keyBy(fn($o) => "{$o->program_type}_{$o->program_id}");

                // Category counters
                $counts = array_fill_keys(array_keys(self::CATEGORY_KEYWORDS), ['activities' => 0, 'students' => 0]);
                $counts['uncategorized'] = ['activities' => 0, 'students' => 0];

                // For deduplicated total
                $totalActivities = 0;
                $totalStudents   = 0;
                $allTitles       = [];

                foreach ($allPrograms as [$program, $type]) {
                    $overrideKey = "{$type}_{$program->id}";
                    $override    = $overrides->get($overrideKey);

                    $students = ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0);
                    $allTitles[] = $program->title;

                    // Deduplicated total (each program counted once)
                    $totalActivities++;
                    $totalStudents += $students;

                    if ($override && !empty($override->manual_categories)) {
                        // Admin override wins — one or more categories
                        foreach ($override->manual_categories as $cat) {
                            if (isset($counts[$cat])) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    } else {
                        $searchText = strtolower($program->title . ' ' . ($program->target_group ?? ''));
                        $matched    = $this->matchCategories($searchText);

                        if (empty($matched)) {
                            $counts['uncategorized']['activities']++;
                            $counts['uncategorized']['students'] += $students;
                        } else {
                            foreach ($matched as $cat) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    }
                }

                $status = $batchA?->status ?? $batchB?->status ?? 'not_submitted';

                $row = [
                    'hei_id'   => $hei->id,
                    'hei_name' => $hei->name,
                    'hei_code' => $hei->code,
                    'status'   => $status,
                    'has_submission' => true,
                    'total_activities' => $totalActivities,
                    'total_students'   => $totalStudents,
                    'services_activities_list' =>
                        implode(', ', array_slice($allTitles, 0, 3))
                        . (count($allTitles) > 3 ? '…' : ''),
                ];

                foreach ($counts as $cat => $data) {
                    $row["{$cat}_activities"] = $data['activities'];
                    $row["{$cat}_students"]   = $data['students'];
                }

                return $row;
            })->toArray();
        }

        return response()->json([
            'data'          => $result,
            'availableYears'=> $availableYears,
            'selectedYear'  => $selectedYear,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Evidence drilldown — programs for a specific HEI + category (or total)
    // ──────────────────────────────────────────────────────────────────────────

    public function getInfoOrientationEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        // Valid categories
        $validCategories = array_merge(array_keys(self::CATEGORY_KEYWORDS), ['uncategorized', 'total']);
        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        // Fetch programs from both annexes
        $programsA = AnnexAProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get()->map(fn($p) => [$p, 'annex_a']);

        $programsB = AnnexBProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get()->map(fn($p) => [$p, 'annex_b']);

        $allPrograms = $programsA->merge($programsB);

        // Fetch overrides
        $idsByType = ['annex_a' => [], 'annex_b' => []];
        foreach ($allPrograms as [$p, $type]) {
            $idsByType[$type][] = $p->id;
        }

        $overrides = ProgramCategoryOverride::where(function ($q) use ($idsByType) {
            foreach ($idsByType as $type => $ids) {
                if (!empty($ids)) {
                    $q->orWhere(fn($q2) =>
                        $q2->where('program_type', $type)->whereIn('program_id', $ids)
                    );
                }
            }
        })->get()->keyBy(fn($o) => "{$o->program_type}_{$o->program_id}");

        $records = [];

        foreach ($allPrograms as [$program, $type]) {
            $overrideKey      = "{$type}_{$program->id}";
            $override         = $overrides->get($overrideKey);
            $manualCategories = $override?->manual_categories ?? [];

            $searchText = strtolower($program->title . ' ' . ($program->target_group ?? ''));

            $includeInCategory = false;

            if ($category === 'total') {
                $includeInCategory = true; // all programs, deduplicated (already unique per loop)
            } elseif (!empty($manualCategories)) {
                $includeInCategory = in_array($category, $manualCategories);
            } else {
                $matched = $this->matchCategories($searchText);

                if ($category === 'uncategorized') {
                    $includeInCategory = empty($matched);
                } else {
                    $includeInCategory = in_array($category, $matched);
                }
            }

            if ($includeInCategory) {
                // Determine which categories this program actually belongs to (for display)
                if (!empty($manualCategories)) {
                    $assignedCategories = $manualCategories;
                } else {
                    $matched = $this->matchCategories($searchText);
                    $assignedCategories = empty($matched) ? ['uncategorized'] : $matched;
                }

                $records[] = [
                    'id'                        => $program->id,
                    'program_type'              => $type,
                    'title'                     => $program->title,
                    'venue'                     => $program->venue,
                    'implementation_date'       => $program->implementation_date?->format('Y-m-d'),
                    'target_group'              => $program->target_group,
                    'participants_online'       => $program->participants_online ?? 0,
                    'participants_face_to_face' => $program->participants_face_to_face ?? 0,
                    'total_participants'        =>
                        ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0),
                    'organizer'                 => $program->organizer,
                    'remarks'                   => $program->remarks,
                    'manual_categories'         => $manualCategories,
                    'assigned_categories'       => $assignedCategories,
                ];
            }
        }

        // Sort by date descending
        usort($records, fn($a, $b) => strcmp($b['implementation_date'] ?? '', $a['implementation_date'] ?? ''));

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Manual category override (PATCH)
    // ──────────────────────────────────────────────────────────────────────────

    public function updateProgramCategory(Request $request)
    {
        $validCategories = implode(',', array_keys(self::CATEGORY_KEYWORDS));

        $request->validate([
            'record_type'  => ['required', 'in:annex_a,annex_b'],
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . $validCategories],
        ]);

        $type       = $request->input('record_type');
        $id         = $request->input('record_id');
        $categories = $request->input('categories'); // null or empty array = reset override

        if (empty($categories)) {
            // Reset: delete the override row so keyword matching takes over again
            ProgramCategoryOverride::where('program_type', $type)
                ->where('program_id', $id)
                ->delete();
        } else {
            ProgramCategoryOverride::updateOrCreate(
                ['program_type' => $type, 'program_id' => $id],
                [
                    'manual_categories' => $categories,
                    'overridden_by'     => $request->user()->id,
                    'overridden_at'     => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Personnel aggregated data  (MER2 + MER1)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Keyword map for position_designation → role category.
     * Works identically to CATEGORY_KEYWORDS for Info-Orientation.
     */
    private const PERSONNEL_ROLE_KEYWORDS = [
        'registered_guidance_counselors' => [
            'registered guidance counselor',
        ],
        'guidance_counseling' => [
            'guidance counselor', 'guidance & counseling', 'guidance and counseling',
            'school counselor', 'guidance counseling', 'mental health counselor',
            'psychological services', 'psychologist',
        ],
        'career_guidance_placement' => [
            'career guidance', 'career counselor', 'career development',
            'placement officer', 'job placement', 'ojt coordinator',
            'internship coordinator', 'practicum coordinator', 'industry linkages',
            'tracer study', 'alumni relations',
        ],
        'registrars' => [
            'registrar',
        ],
        'admission_personnel' => [
            'admission officer', 'admissions coordinator', 'admission personnel',
            'enrollment officer', 'admissions officer',
        ],
        'physician' => [
            'physician', 'medical officer', 'school physician', 'doctor',
        ],
        'dentist' => [
            'dentist', 'dental health', 'school dentist',
        ],
        'nurse' => [
            'nurse', 'nursing personnel', 'school nurse',
        ],
        'other_medical_health' => [
            'medical technologist', 'pharmacist', 'pharmacy', 'nutritionist',
            'dietitian', 'sanitation officer', 'health services coordinator',
            'medical records', 'first aid', 'health education',
        ],
        'security_personnel' => [
            'security personnel', 'security officer', 'campus security',
            'safety officer', 'traffic',
        ],
        'food_service_personnel' => [
            'food service', 'cafeteria', 'canteen manager', 'food safety',
            'nutrition program',
        ],
        'cultural_affairs' => [
            'cultural affairs', 'cultural activities', 'arts & culture',
            'arts and culture', 'campus ministry', 'chaplain',
        ],
        'sports_development' => [
            'sports development', 'athletics coordinator', 'sports & recreation',
            'sports and recreation', 'varsity coach', 'physical education',
        ],
        'student_discipline' => [
            'discipline', 'conduct officer', 'student discipline',
        ],
        'scholarship_personnel' => [
            'scholarship coordinator', 'scholarship officer', 'financial aid',
            'student grants',
        ],
        'housing_residential' => [
            'housing officer', 'dormitory manager', 'dormitory supervisor',
            'residence hall', 'residential life', 'dorm personnel',
            'hostel manager',
        ],
        'pwd_special_needs' => [
            'pwd', 'disability support', 'special needs', 'sped coordinator',
            'inclusive education', 'learning support', 'accessibility services',
            'persons with disabilities',
        ],
        'student_governance' => [
            'student government', 'student council', 'student governance',
        ],
        'student_publication' => [
            'student publication', 'campus journalism', 'student media',
        ],
        'multi_faith' => [
            'multi-faith', 'multifaith', 'religious affairs', 'chaplain',
            'campus ministry',
        ],
    ];

    /**
     * Match position_designation text against role category keywords.
     * Returns array of matching category keys (can be multiple).
     */
    private function matchPersonnelCategories(string $positionText): array
    {
        $matched = [];
        $lower = strtolower($positionText);

        foreach (self::PERSONNEL_ROLE_KEYWORDS as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $matched[] = $category;
                    break;
                }
            }
        }

        return $matched;
    }

    /**
     * GET /admin/summary/personnel?year=XXXX
     *
     * Returns per-HEI personnel counts per role category,
     * derived from mer2_personnel.position_designation via keyword matching.
     * SAS Head name comes from mer1_submissions.
     */
    public function getPersonnelData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = MER2Submission::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values()
            ->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            // MER2 submissions with eager-loaded personnel
            $mer2Submissions = MER2Submission::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('personnel')
                ->get()
                ->keyBy('hei_id');

            // MER1 submissions — just need sas_head_name + sas_head_position
            $mer1Submissions = MER1Submission::where('academic_year', $selectedYear)
                ->whereIn('status', ['approved', 'published', 'submitted', 'request'])
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($mer2Submissions, $mer1Submissions, $selectedYear) {
                $submission = $mer2Submissions->get($hei->id);
                $mer1       = $mer1Submissions->get($hei->id);

                $sasHeadName = $mer1?->sas_head_name ?? null;

                if (!$submission) {
                    return $this->emptyPersonnelRow($hei, $selectedYear, $sasHeadName);
                }

                // Fetch overrides for all personnel in this submission
                $personnelIds = $submission->personnel->pluck('id')->toArray();
                $overrides = PersonnelCategoryOverride::whereIn('personnel_id', $personnelIds)
                    ->get()
                    ->keyBy('personnel_id');

                // Count buckets — one per category + uncategorized
                $counts = array_fill_keys(array_keys(self::PERSONNEL_ROLE_KEYWORDS), 0);
                $counts['uncategorized'] = 0;
                $totalPersonnel = 0;

                foreach ($submission->personnel as $person) {
                    $override = $overrides->get($person->id);
                    $totalPersonnel++;

                    if ($override && !empty($override->manual_categories)) {
                        // Admin override wins
                        foreach ($override->manual_categories as $cat) {
                            if (isset($counts[$cat])) {
                                $counts[$cat]++;
                            }
                        }
                    } else {
                        if (empty($person->position_designation)) {
                            $counts['uncategorized']++;
                            continue;
                        }

                        $matched = $this->matchPersonnelCategories($person->position_designation);

                        if (empty($matched)) {
                            $counts['uncategorized']++;
                        } else {
                            foreach ($matched as $cat) {
                                $counts[$cat]++;
                            }
                        }
                    }
                }

                $row = [
                    'hei_id'          => $hei->id,
                    'hei_code'        => $hei->code,
                    'hei_name'        => $hei->name,
                    'hei_type'        => $hei->type,
                    'status'          => $submission->status,
                    'has_submission'  => true,
                    'sas_head_name'   => $sasHeadName,
                    'total_personnel' => $totalPersonnel,
                ];

                foreach ($counts as $cat => $count) {
                    $row[$cat] = $count;
                }

                return $row;
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/personnel/{heiId}/{category}/evidence?year=XXXX
     *
     * Drilldown — returns the actual personnel records for a specific HEI + category.
     * Category 'total' returns all personnel.
     */
    public function getPersonnelEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $validCategories = array_merge(array_keys(self::PERSONNEL_ROLE_KEYWORDS), ['uncategorized', 'total']);
        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $submission = MER2Submission::where('hei_id', $heiId)
            ->where('academic_year', $selectedYear)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('personnel')
            ->first();

        if (!$submission) {
            return response()->json([
                'hei_name'    => $hei->name,
                'category'    => $category,
                'records'     => [],
                'total_count' => 0,
            ]);
        }

        // Fetch overrides for all personnel in this submission
        $personnelIds = $submission->personnel->pluck('id')->toArray();
        $overrides = PersonnelCategoryOverride::whereIn('personnel_id', $personnelIds)
            ->get()
            ->keyBy('personnel_id');

        $records = [];

        foreach ($submission->personnel as $person) {
            $override         = $overrides->get($person->id);
            $manualCategories = $override?->manual_categories ?? [];

            // Determine effective categories for filtering and display
            if (!empty($manualCategories)) {
                $assignedCategories = $manualCategories;
            } else {
                $matched = empty($person->position_designation)
                    ? []
                    : $this->matchPersonnelCategories($person->position_designation);
                $assignedCategories = empty($matched) ? ['uncategorized'] : $matched;
            }

            // Filter: should this record appear in the requested category?
            $include = false;
            if ($category === 'total') {
                $include = true;
            } elseif ($category === 'uncategorized') {
                $include = in_array('uncategorized', $assignedCategories);
            } else {
                $include = in_array($category, $assignedCategories);
            }

            if ($include) {
                $records[] = [
                    'id'                           => $person->id,
                    'office_type'                  => $person->office_type_label,
                    'name_of_personnel'            => $person->name_of_personnel,
                    'position_designation'         => $person->position_designation,
                    'tenure_nature_of_appointment' => $person->tenure_nature_of_appointment,
                    'years_in_office'              => $person->years_in_office,
                    'qualification_highest_degree' => $person->qualification_highest_degree,
                    'license_no_type'              => $person->license_no_type,
                    'license_expiry_date'          => $person->license_expiry_date
                        ? $person->license_expiry_date->format('Y-m-d')
                        : null,
                    'manual_categories'            => $manualCategories,
                    'assigned_categories'          => $assignedCategories,
                ];
            }
        }

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    /**
     * PATCH /admin/summary/personnel/category
     *
     * Upsert or delete a personnel category override.
     * Empty categories array = reset override (reverts to keyword matching).
     */
    public function updatePersonnelCategory(Request $request)
    {
        $validCategories = implode(',', array_keys(self::PERSONNEL_ROLE_KEYWORDS));

        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . $validCategories],
        ]);

        $personnelId = $request->input('record_id'); // RecordsModal sends record_id
        $categories  = $request->input('categories'); // null or empty = reset

        if (empty($categories)) {
            PersonnelCategoryOverride::where('personnel_id', $personnelId)->delete();
        } else {
            PersonnelCategoryOverride::updateOrCreate(
                ['personnel_id' => $personnelId],
                [
                    'manual_categories' => $categories,
                    'overridden_by'     => $request->user()->id,
                    'overridden_at'     => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function emptyPersonnelRow(HEI $hei, string $year, ?string $sasHeadName): array
    {
        $row = [
            'hei_id'          => $hei->id,
            'hei_code'        => $hei->code,
            'hei_name'        => $hei->name,
            'hei_type'        => $hei->type,
            'status'          => 'not_submitted',
            'has_submission'  => false,
            'sas_head_name'   => $sasHeadName,
            'total_personnel' => 0,
            'uncategorized'   => 0,
        ];

        foreach (array_keys(self::PERSONNEL_ROLE_KEYWORDS) as $cat) {
            $row[$cat] = 0;
        }

        return $row;
    }

    private function emptyHeiRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'                  => $hei->id,
            'hei_name'                => $hei->name,
            'hei_code'                => $hei->code,
            'status'                  => 'not_submitted',
            'has_submission'          => false,
            'total_activities'        => 0,
            'total_students'          => 0,
            'services_activities_list'=> '',
            'uncategorized_activities'=> 0,
            'uncategorized_students'  => 0,
        ];

        foreach (array_keys(self::CATEGORY_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Guidance Counselling — keyword map
    // ──────────────────────────────────────────────────────────────────────────

    private const GUIDANCE_COUNSELLING_KEYWORDS = [
        'individual_inventory' => [
            'individual inventory', 'individual record', 'case study', 'intake form',
            'personal data', 'student record', 'cumulative record',
        ],
        'counseling_service' => [
            'counseling', 'counselling', 'individual counseling', 'group counseling',
            'crisis counseling', 'crisis intervention', 'psychosocial',
        ],
        'referral' => [
            'referral', 'refer', 'endorsement', 'case referral',
        ],
        'testing_appraisal' => [
            'testing', 'appraisal', 'psychological test', 'aptitude', 'interest inventory',
            'assessment', 'evaluation test', 'intelligence test', 'personality test',
        ],
        'follow_up' => [
            'follow-up', 'follow up', 'followup', 'monitoring', 'progress check',
        ],
        'peer_facilitating' => [
            'peer facilitat', 'peer helper', 'peer counselor', 'peer educator',
            'peer support', 'peer program', 'peer activity',
        ],
    ];

    private function matchGuidanceCounsellingCategories(string $searchText): array
    {
        $matched = [];
        $lower   = strtolower($searchText);

        foreach (self::GUIDANCE_COUNSELLING_KEYWORDS as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $matched[] = $category;
                    break;
                }
            }
        }

        return $matched;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Guidance Counselling aggregated data  (Annex B only)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/guidance-counselling?year=XXXX
     */
    public function getGuidanceCounsellingData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexBBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $annexBBatches = AnnexBBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($annexBBatches, $selectedYear) {
                $batch = $annexBBatches->get($hei->id);

                if (!$batch || $batch->programs->isEmpty()) {
                    return $this->emptyGuidanceCounsellingRow($hei, $selectedYear);
                }

                // Fetch overrides for this batch's programs
                $programIds = $batch->programs->pluck('id')->toArray();
                $overrides  = GuidanceCounsellingCategoryOverride::whereIn('program_id', $programIds)
                    ->get()->keyBy('program_id');

                $counts = array_fill_keys(array_keys(self::GUIDANCE_COUNSELLING_KEYWORDS), [
                    'activities' => 0,
                    'students'   => 0,
                ]);
                $counts['others'] = ['activities' => 0, 'students' => 0];

                $totalActivities = 0;
                $totalStudents   = 0;
                $otherTitles     = [];

                foreach ($batch->programs as $program) {
                    $override = $overrides->get($program->id);
                    $students = ($program->participants_online ?? 0)
                              + ($program->participants_face_to_face ?? 0);

                    $totalActivities++;
                    $totalStudents += $students;

                    if ($override && !empty($override->manual_categories)) {
                        foreach ($override->manual_categories as $cat) {
                            if (isset($counts[$cat])) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    } else {
                        $searchText = strtolower($program->title . ' ' . ($program->target_group ?? ''));
                        $matched    = $this->matchGuidanceCounsellingCategories($searchText);

                        if (empty($matched)) {
                            $counts['others']['activities']++;
                            $counts['others']['students'] += $students;
                            $otherTitles[] = $program->title;
                        } else {
                            foreach ($matched as $cat) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    }
                }

                $row = [
                    'hei_id'           => $hei->id,
                    'hei_name'         => $hei->name,
                    'hei_code'         => $hei->code,
                    'status'           => $batch->status,
                    'has_submission'   => true,
                    'total_activities' => $totalActivities,
                    'total_students'   => $totalStudents,
                    'others_titles'    =>
                        implode(', ', array_slice($otherTitles, 0, 3))
                        . (count($otherTitles) > 3 ? '…' : ''),
                ];

                foreach ($counts as $cat => $data) {
                    $row["{$cat}_activities"] = $data['activities'];
                    $row["{$cat}_students"]   = $data['students'];
                }

                return $row;
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/guidance-counselling/{heiId}/{category}/evidence?year=XXXX
     */
    public function getGuidanceCounsellingEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $validCategories = array_merge(array_keys(self::GUIDANCE_COUNSELLING_KEYWORDS), ['others', 'total']);
        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $programs = AnnexBProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get();

        $programIds = $programs->pluck('id')->toArray();
        $overrides  = GuidanceCounsellingCategoryOverride::whereIn('program_id', $programIds)
            ->get()->keyBy('program_id');

        $records = [];

        foreach ($programs as $program) {
            $override         = $overrides->get($program->id);
            $manualCategories = $override?->manual_categories ?? [];

            if (!empty($manualCategories)) {
                $assignedCategories = $manualCategories;
            } else {
                $searchText = strtolower($program->title . ' ' . ($program->target_group ?? ''));
                $matched    = $this->matchGuidanceCounsellingCategories($searchText);
                $assignedCategories = empty($matched) ? ['others'] : $matched;
            }

            $include = false;
            if ($category === 'total') {
                $include = true;
            } elseif ($category === 'others') {
                $include = in_array('others', $assignedCategories);
            } else {
                $include = in_array($category, $assignedCategories);
            }

            if ($include) {
                $records[] = [
                    'id'                        => $program->id,
                    'title'                     => $program->title,
                    'venue'                     => $program->venue,
                    'implementation_date'       => $program->implementation_date?->format('Y-m-d'),
                    'target_group'              => $program->target_group,
                    'participants_online'       => $program->participants_online ?? 0,
                    'participants_face_to_face' => $program->participants_face_to_face ?? 0,
                    'total_participants'        =>
                        ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0),
                    'organizer'                 => $program->organizer,
                    'remarks'                   => $program->remarks,
                    'manual_categories'         => $manualCategories,
                    'assigned_categories'       => $assignedCategories,
                ];
            }
        }

        usort($records, fn($a, $b) =>
            strcmp($b['implementation_date'] ?? '', $a['implementation_date'] ?? '')
        );

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    /**
     * PATCH /admin/summary/guidance-counselling/category
     */
    public function updateGuidanceCounsellingCategory(Request $request)
    {
        $validCategories = implode(',', array_keys(self::GUIDANCE_COUNSELLING_KEYWORDS));

        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . $validCategories],
        ]);

        $programId  = $request->input('record_id');
        $categories = $request->input('categories');

        if (empty($categories)) {
            GuidanceCounsellingCategoryOverride::where('program_id', $programId)->delete();
        } else {
            GuidanceCounsellingCategoryOverride::updateOrCreate(
                ['program_id' => $programId],
                [
                    'manual_categories' => $categories,
                    'overridden_by'     => $request->user()->id,
                    'overridden_at'     => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    private function emptyGuidanceCounsellingRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'           => $hei->id,
            'hei_name'         => $hei->name,
            'hei_code'         => $hei->code,
            'status'           => 'not_submitted',
            'has_submission'   => false,
            'total_activities' => 0,
            'total_students'   => 0,
            'others_titles'    => '',
            'others_activities'=> 0,
            'others_students'  => 0,
        ];

        foreach (array_keys(self::GUIDANCE_COUNSELLING_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Career / Job Placement — keyword map
    // ──────────────────────────────────────────────────────────────────────────

    private const CAREER_JOB_KEYWORDS = [
        'labor_empowerment' => [
            'labor empowerment', 'career guidance conference', 'graduating student',
            'ra 11551', 'republic act 11551', 'career congress', 'career readiness',
            'pre-employment', 'employment readiness', 'career conference',
        ],
        'job_fairs' => [
            'job fair', 'jobfair', 'job expo', 'career fair', 'career expo',
            'dole', 'peso', 'employment fair', 'recruitment fair',
            'hiring fair', 'job hunt', 'job market',
        ],
        'phil_job_net' => [
            'philjobnet', 'phil job net', 'jobnet', 'job portal',
            'job registration', 'online job registration', 'career portal',
            'employment portal', 'job matching',
        ],
        'career_counseling' => [
            'career counseling', 'career counselling', 'vocational counseling',
            'vocational counselling', 'employment counseling', 'job counseling',
            'career advising', 'career advice', 'career planning',
            'career assessment', 'career coaching',
        ],
    ];

    private function matchCareerJobCategories(string $searchText): array
    {
        $matched = [];
        $lower   = strtolower($searchText);

        foreach (self::CAREER_JOB_KEYWORDS as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $matched[] = $category;
                    break;
                }
            }
        }

        return $matched;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Career / Job Placement — aggregated data  (Annex C only)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/career-job?year=XXXX
     */
    public function getCareerJobData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexCBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $annexCBatches = AnnexCBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($annexCBatches, $selectedYear) {
                $batch = $annexCBatches->get($hei->id);

                if (!$batch || $batch->programs->isEmpty()) {
                    return $this->emptyCareerJobRow($hei, $selectedYear);
                }

                $programIds = $batch->programs->pluck('id')->toArray();
                $overrides  = CareerJobCategoryOverride::whereIn('program_id', $programIds)
                    ->get()->keyBy('program_id');

                $counts = array_fill_keys(array_keys(self::CAREER_JOB_KEYWORDS), [
                    'activities' => 0,
                    'students'   => 0,
                ]);
                $counts['others'] = ['activities' => 0, 'students' => 0];

                $totalActivities = 0;
                $totalStudents   = 0;
                $otherTitles     = [];

                foreach ($batch->programs as $program) {
                    $override = $overrides->get($program->id);
                    $students = ($program->participants_online ?? 0)
                              + ($program->participants_face_to_face ?? 0);

                    $totalActivities++;
                    $totalStudents += $students;

                    if ($override && !empty($override->manual_categories)) {
                        foreach ($override->manual_categories as $cat) {
                            if (isset($counts[$cat])) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    } else {
                        $matched = $this->matchCareerJobCategories(strtolower($program->title));

                        if (empty($matched)) {
                            $counts['others']['activities']++;
                            $counts['others']['students'] += $students;
                            $otherTitles[] = $program->title;
                        } else {
                            foreach ($matched as $cat) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    }
                }

                $row = [
                    'hei_id'           => $hei->id,
                    'hei_name'         => $hei->name,
                    'hei_code'         => $hei->code,
                    'status'           => $batch->status,
                    'has_submission'   => true,
                    'total_activities' => $totalActivities,
                    'total_students'   => $totalStudents,
                    'others_titles'    =>
                        implode(', ', array_slice($otherTitles, 0, 3))
                        . (count($otherTitles) > 3 ? '…' : ''),
                ];

                foreach ($counts as $cat => $data) {
                    $row["{$cat}_activities"] = $data['activities'];
                    $row["{$cat}_students"]   = $data['students'];
                }

                return $row;
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/career-job/{heiId}/{category}/evidence?year=XXXX
     */
    public function getCareerJobEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $validCategories = array_merge(array_keys(self::CAREER_JOB_KEYWORDS), ['others', 'total']);
        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $programs = AnnexCProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get();

        $programIds = $programs->pluck('id')->toArray();
        $overrides  = CareerJobCategoryOverride::whereIn('program_id', $programIds)
            ->get()->keyBy('program_id');

        $records = [];

        foreach ($programs as $program) {
            $override         = $overrides->get($program->id);
            $manualCategories = $override?->manual_categories ?? [];

            if (!empty($manualCategories)) {
                $assignedCategories = $manualCategories;
            } else {
                $matched            = $this->matchCareerJobCategories(strtolower($program->title));
                $assignedCategories = empty($matched) ? ['others'] : $matched;
            }

            $include = match($category) {
                'total'  => true,
                'others' => in_array('others', $assignedCategories),
                default  => in_array($category, $assignedCategories),
            };

            if ($include) {
                $records[] = [
                    'id'                        => $program->id,
                    'title'                     => $program->title,
                    'venue'                     => $program->venue,
                    'implementation_date'       => $program->implementation_date?->format('Y-m-d'),
                    'participants_online'       => $program->participants_online ?? 0,
                    'participants_face_to_face' => $program->participants_face_to_face ?? 0,
                    'total_participants'        =>
                        ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0),
                    'organizer'                 => $program->organizer,
                    'remarks'                   => $program->remarks,
                    'manual_categories'         => $manualCategories,
                    'assigned_categories'       => $assignedCategories,
                ];
            }
        }

        usort($records, fn($a, $b) =>
            strcmp($b['implementation_date'] ?? '', $a['implementation_date'] ?? '')
        );

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    /**
     * PATCH /admin/summary/career-job/category
     */
    public function updateCareerJobCategory(Request $request)
    {
        $validCategories = implode(',', array_keys(self::CAREER_JOB_KEYWORDS));

        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . $validCategories],
        ]);

        $programId  = $request->input('record_id');
        $categories = $request->input('categories');

        if (empty($categories)) {
            CareerJobCategoryOverride::where('program_id', $programId)->delete();
        } else {
            CareerJobCategoryOverride::updateOrCreate(
                ['program_id' => $programId],
                [
                    'manual_categories' => $categories,
                    'overridden_by'     => $request->user()->id,
                    'overridden_at'     => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    private function emptyCareerJobRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'            => $hei->id,
            'hei_name'          => $hei->name,
            'hei_code'          => $hei->code,
            'status'            => 'not_submitted',
            'has_submission'    => false,
            'total_activities'  => 0,
            'total_students'    => 0,
            'others_titles'     => '',
            'others_activities' => 0,
            'others_students'   => 0,
        ];

        foreach (array_keys(self::CAREER_JOB_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Health Services — keyword map
    // ──────────────────────────────────────────────────────────────────────────

    private const HEALTH_KEYWORDS = [
        'medical_checkup' => [
            'medical', 'medical check', 'check-up', 'checkup', 'check up',
            'consultation', 'physician', 'clinic', 'annual physical',
            'physical exam', 'health exam', 'health check', 'medical exam',
            'general check', 'medical consultation',
        ],
        'dental_checkup' => [
            'dental', 'dentist', 'oral health', 'oral exam', 'dental check',
            'dental exam', 'teeth', 'tooth', 'dental consultation',
            'dental clinic', 'oral checkup',
        ],
        'seminar_educational' => [
            'seminar', 'educational tour', 'tour', 'field trip', 'webinar',
            'lecture', 'forum', 'symposium', 'health seminar', 'health forum',
            'health education', 'wellness seminar', 'talk', 'orientation',
            'health awareness', 'first aid', 'training',
        ],
    ];

    private function matchHealthCategories(string $searchText): array
    {
        $matched = [];
        $lower   = strtolower($searchText);

        foreach (self::HEALTH_KEYWORDS as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $matched[] = $category;
                    break;
                }
            }
        }

        return $matched;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Health Services — aggregated data  (Annex J only)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/health?year=XXXX
     */
    public function getHealthData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexJBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $annexJBatches = AnnexJBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($annexJBatches, $selectedYear) {
                $batch = $annexJBatches->get($hei->id);

                if (!$batch || $batch->programs->isEmpty()) {
                    return $this->emptyHealthRow($hei, $selectedYear);
                }

                $programIds = $batch->programs->pluck('id')->toArray();
                $overrides  = HealthCategoryOverride::whereIn('program_id', $programIds)
                    ->get()->keyBy('program_id');

                $counts = array_fill_keys(array_keys(self::HEALTH_KEYWORDS), [
                    'activities' => 0,
                    'students'   => 0,
                ]);
                $counts['others'] = ['activities' => 0, 'students' => 0];

                $totalActivities = 0;
                $totalStudents   = 0;
                $otherTitles     = [];

                foreach ($batch->programs as $program) {
                    $override = $overrides->get($program->id);
                    $students = $program->number_of_participants ?? 0;

                    $totalActivities++;
                    $totalStudents += $students;

                    if ($override && !empty($override->manual_categories)) {
                        foreach ($override->manual_categories as $cat) {
                            if (isset($counts[$cat])) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    } else {
                        $matched = $this->matchHealthCategories($program->title_of_program ?? '');

                        if (empty($matched)) {
                            $counts['others']['activities']++;
                            $counts['others']['students'] += $students;
                            $otherTitles[] = $program->title_of_program;
                        } else {
                            foreach ($matched as $cat) {
                                $counts[$cat]['activities']++;
                                $counts[$cat]['students'] += $students;
                            }
                        }
                    }
                }

                $row = [
                    'hei_id'           => $hei->id,
                    'hei_name'         => $hei->name,
                    'hei_code'         => $hei->code,
                    'status'           => $batch->status,
                    'has_submission'   => true,
                    'total_activities' => $totalActivities,
                    'total_students'   => $totalStudents,
                    'others_titles'    =>
                        implode(', ', array_slice($otherTitles, 0, 3))
                        . (count($otherTitles) > 3 ? '…' : ''),
                ];

                foreach ($counts as $cat => $data) {
                    $row["{$cat}_activities"] = $data['activities'];
                    $row["{$cat}_students"]   = $data['students'];
                }

                return $row;
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/health/{heiId}/{category}/evidence?year=XXXX
     */
    public function getHealthEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $validCategories = array_merge(array_keys(self::HEALTH_KEYWORDS), ['others', 'total']);
        if (!in_array($category, $validCategories)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $programs = AnnexJProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get();

        $programIds = $programs->pluck('id')->toArray();
        $overrides  = HealthCategoryOverride::whereIn('program_id', $programIds)
            ->get()->keyBy('program_id');

        $records = [];

        foreach ($programs as $program) {
            $override         = $overrides->get($program->id);
            $manualCategories = $override?->manual_categories ?? [];

            if (!empty($manualCategories)) {
                $assignedCategories = $manualCategories;
            } else {
                $matched            = $this->matchHealthCategories($program->title_of_program ?? '');
                $assignedCategories = empty($matched) ? ['others'] : $matched;
            }

            $include = match($category) {
                'total'  => true,
                'others' => in_array('others', $assignedCategories),
                default  => in_array($category, $assignedCategories),
            };

            if ($include) {
                $records[] = [
                    'id'                     => $program->id,
                    'title_of_program'       => $program->title_of_program,
                    'organizer'              => $program->organizer,
                    'number_of_participants' => $program->number_of_participants ?? 0,
                    'remarks'                => $program->remarks,
                    'manual_categories'      => $manualCategories,
                    'assigned_categories'    => $assignedCategories,
                ];
            }
        }

        usort($records, fn($a, $b) =>
            strcmp($a['title_of_program'] ?? '', $b['title_of_program'] ?? '')
        );

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    /**
     * PATCH /admin/summary/health/category
     */
    public function updateHealthCategory(Request $request)
    {
        $validCategories = implode(',', array_keys(self::HEALTH_KEYWORDS));

        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . $validCategories],
        ]);

        $programId  = $request->input('record_id');
        $categories = $request->input('categories');

        if (empty($categories)) {
            HealthCategoryOverride::where('program_id', $programId)->delete();
        } else {
            HealthCategoryOverride::updateOrCreate(
                ['program_id' => $programId],
                [
                    'manual_categories' => $categories,
                    'overridden_by'     => $request->user()->id,
                    'overridden_at'     => now(),
                ]
            );
        }

        return response()->json(['success' => true]);
    }

    private function emptyHealthRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'            => $hei->id,
            'hei_name'          => $hei->name,
            'hei_code'          => $hei->code,
            'status'            => 'not_submitted',
            'has_submission'    => false,
            'total_activities'  => 0,
            'total_students'    => 0,
            'others_titles'     => '',
            'others_activities' => 0,
            'others_students'   => 0,
        ];

        foreach (array_keys(self::HEALTH_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Admission Services (Annex H)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Maps service_type string to flat field key via substring match.
     * Returns null for services we don't display (e.g. Assessment).
     */
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

        return null; // 'Assessment' and anything unrecognised
    }

    /**
     * GET /admin/summary/admission?year=XXXX
     *
     * Returns one row per HEI with 7 boolean fields derived from
     * annex_h_admission_services.with (yes/no per service type).
     */
    public function getAdmissionData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexHBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexHBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('admissionServices')
                ->get()
                ->keyBy('hei_id');

            $fields = [
                'admission_policy', 'pwd_guidelines', 'foreign_guidelines',
                'drug_testing', 'medical_cert', 'online_enrollment', 'entrance_exam',
            ];

            $result = $heis->map(function ($hei) use ($batches, $fields) {
                $batch = $batches->get($hei->id);

                $row = [
                    'hei_id'         => $hei->id,
                    'hei_code'       => $hei->code,
                    'hei_name'       => $hei->name,
                    'status'         => $batch?->status ?? 'not_submitted',
                    'has_submission' => (bool) $batch,
                ];

                // Default all fields to null (not submitted)
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
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Social Community / Outreach (Annex O)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/social-community?year=XXXX
     *
     * Returns one row per HEI with total activities and total beneficiaries
     * aggregated from annex_o_programs via annex_o_batches.
     */
    public function getAnnexOData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexOBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexOBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch || $batch->programs->isEmpty()) {
                    return [
                        'hei_id'            => $hei->id,
                        'hei_code'          => $hei->code,
                        'hei_name'          => $hei->name,
                        'status'            => $batch?->status ?? 'not_submitted',
                        'has_submission'    => (bool) $batch,
                        'total_activities'  => $batch ? 0 : null,
                        'total_participants'=> $batch ? 0 : null,
                    ];
                }

                return [
                    'hei_id'            => $hei->id,
                    'hei_code'          => $hei->code,
                    'hei_name'          => $hei->name,
                    'status'            => $batch->status,
                    'has_submission'    => true,
                    'total_activities'  => $batch->programs->count(),
                    'total_participants'=> $batch->programs->sum('number_of_beneficiaries'),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/social-community/{heiId}/evidence?year=XXXX
     *
     * Returns the individual Annex O programs for a specific HEI.
     */
    public function getAnnexOEvidence(Request $request, $heiId)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $programs = AnnexOProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('date_conducted', 'desc')->get();

        $records = $programs->map(fn($p) => [
            'id'                          => $p->id,
            'title_of_program'            => $p->title_of_program,
            'date_conducted'              => $p->date_conducted?->format('Y-m-d'),
            'number_of_beneficiaries'     => $p->number_of_beneficiaries ?? 0,
            'type_of_community_service'   => $p->type_of_community_service,
            'community_population_served' => $p->community_population_served,
        ])->values()->toArray();

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Student Discipline (Annex F)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/student-discipline?year=XXXX
     *
     * Returns one row per HEI with 3 boolean presence fields derived from
     * annex_f_batches — a field is "present" when it contains a non-empty string.
     */
    public function getStudentDisciplineData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexFBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexFBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                return [
                    'hei_id'                       => $hei->id,
                    'hei_code'                     => $hei->code,
                    'hei_name'                     => $hei->name,
                    'status'                       => $batch?->status ?? 'not_submitted',
                    'has_submission'               => (bool) $batch,
                    'student_discipline_committee' => $batch ? !empty(trim($batch->student_discipline_committee ?? '')) : null,
                    'procedure_mechanism'          => $batch ? !empty(trim($batch->procedure_mechanism ?? '')) : null,
                    'complaint_desk'               => $batch ? !empty(trim($batch->complaint_desk ?? '')) : null,
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Student Organizations (Annex E)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/student-organization?year=XXXX
     */
    public function getAnnexEData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexEBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexEBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('organizations')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'               => $hei->id,
                        'hei_code'             => $hei->code,
                        'hei_name'             => $hei->name,
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
                    'status'               => $batch->status,
                    'has_submission'       => true,
                    'total_organizations'  => $orgs->count(),
                    'total_with_activities'=> $orgs->filter(
                        fn($o) => !empty(trim($o->programs_projects_activities ?? ''))
                    )->count(),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/student-organization/{heiId}/evidence?year=XXXX
     */
    public function getAnnexEEvidence(Request $request, $heiId)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $organizations = AnnexEOrganization::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('name_of_accredited', 'asc')->get();

        $records = $organizations->map(fn($o) => [
            'id'                           => $o->id,
            'name_of_accredited'           => $o->name_of_accredited,
            'years_of_existence'           => $o->years_of_existence,
            'accredited_since'             => $o->accredited_since,
            'faculty_adviser'              => $o->faculty_adviser,
            'president_and_officers'       => $o->president_and_officers,
            'specialization'               => $o->specialization,
            'fee_collected'                => $o->fee_collected,
            'programs_projects_activities' => $o->programs_projects_activities,
        ])->values()->toArray();

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Culture and the Arts (Annex N)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/culture?year=XXXX
     */
    public function getAnnexNData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexNBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexNBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('activities')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'             => $hei->id,
                        'hei_code'           => $hei->code,
                        'hei_name'           => $hei->name,
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
                    'status'             => $batch->status,
                    'has_submission'     => true,
                    'total_activities'   => $batch->activities->count(),
                    'total_participants' => $batch->activities->sum('number_of_participants'),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/culture/{heiId}/evidence?year=XXXX
     */
    public function getAnnexNEvidence(Request $request, $heiId)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $activities = AnnexNActivity::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('implementation_date', 'desc')->get();

        $records = $activities->map(fn($a) => [
            'id'                   => $a->id,
            'title_of_activity'    => $a->title_of_activity,
            'implementation_date'  => $a->implementation_date?->format('Y-m-d'),
            'implementation_venue' => $a->implementation_venue,
            'total_participants'   => $a->number_of_participants ?? 0,
            'organizer'            => $a->organizer,
            'remarks'              => $a->remarks,
        ])->values()->toArray();

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Scholarships and Financial Assistance (Annex I)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/scholarship?year=XXXX
     */
    public function getAnnexIData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexIBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexIBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('scholarships')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'              => $hei->id,
                        'hei_code'            => $hei->code,
                        'hei_name'            => $hei->name,
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
                    'status'              => $batch->status,
                    'has_submission'      => true,
                    'total_scholarships'  => $batch->scholarships->count(),
                    'total_beneficiaries' => $batch->scholarships->sum('number_of_beneficiaries'),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/scholarship/{heiId}/evidence?year=XXXX
     */
    public function getAnnexIEvidence(Request $request, $heiId)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $scholarships = AnnexIScholarship::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('scholarship_name', 'asc')->get();

        $records = $scholarships->map(fn($s) => [
            'id'                              => $s->id,
            'scholarship_name'                => $s->scholarship_name,
            'type'                            => $s->type,
            'category_intended_beneficiaries' => $s->category_intended_beneficiaries,
            'number_of_beneficiaries'         => $s->number_of_beneficiaries,
            'remarks'                         => $s->remarks,
        ])->values()->toArray();

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Safety and Security (Annex K)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Keyword match helper for a single committee field.
     * Returns true if ANY committee row in the collection matches the keywords
     * and does NOT match any of the exclude keywords.
     */
    private function matchKCommitteeField(
        $committees,
        array $keywords,
        array $excludeKeywords = []
    ): bool {
        return $committees->contains(function ($committee) use ($keywords, $excludeKeywords) {
            $name = strtolower($committee->committee_name ?? '');

            // Must match at least one include keyword
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

            // Must not match any exclude keyword
            foreach ($excludeKeywords as $ex) {
                if (str_contains($name, strtolower($ex))) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * GET /admin/summary/safety-security?year=XXXX
     */
    public function getAnnexKData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexKBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexKBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('committees')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'                    => $hei->id,
                        'hei_code'                  => $hei->code,
                        'hei_name'                  => $hei->name,
                        'status'                    => 'not_submitted',
                        'has_submission'            => false,
                        'safety_security_committee' => null,
                        'disaster_risk_reduction'   => null,
                        'calamity_management'       => null,
                        'crisis_management_committee' => null,
                        'crisis_psychosocial'       => null,
                        'drug_free_committee'       => null,
                        'drug_education_trained'    => null,
                    ];
                }

                $committees = $batch->committees;

                return [
                    'hei_id'         => $hei->id,
                    'hei_code'       => $hei->code,
                    'hei_name'       => $hei->name,
                    'status'         => $batch->status,
                    'has_submission' => true,

                    'safety_security_committee' => $this->matchKCommitteeField(
                        $committees,
                        ['safety and security', 'safety & security', 'safety committee', 'security committee', 'health safety', 'fire safety', 'safety'],
                        ['drug', 'disaster', 'crisis', 'calamity', 'psycho']
                    ),

                    'disaster_risk_reduction' => $this->matchKCommitteeField(
                        $committees,
                        ['disaster risk', 'drrm', 'drr', 'disaster management', 'risk reduction', 'disaster risk reduction']
                    ),

                    'calamity_management' => $this->matchKCommitteeField(
                        $committees,
                        ['calamity management', 'calamity', 'institutional calamity', 'emergency management', 'emergency response team', 'emergency response committee']
                    ),

                    'crisis_management_committee' => $this->matchKCommitteeField(
                        $committees,
                        ['crisis management', 'crisis committee', 'crisis response', 'critical incident', 'incident management'],
                        ['psychosocial', 'psychological']
                    ),

                    'crisis_psychosocial' => $this->matchKCommitteeField(
                        $committees,
                        ['psychosocial', 'psychological support', 'mental health support', 'psychosocial support', 'crisis counseling', 'trauma response', 'crisis psychosocial']
                    ),

                    'drug_free_committee' => $this->matchKCommitteeField(
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
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Student Housing / Dormitory (Annex L)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/dorm?year=XXXX
     */
    public function getAnnexLData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexLBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            $batches = AnnexLBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('housing')
                ->get()
                ->keyBy('hei_id');

            $result = $heis->map(function ($hei) use ($batches) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'        => $hei->id,
                        'hei_code'      => $hei->code,
                        'hei_name'      => $hei->name,
                        'status'        => 'not_submitted',
                        'has_submission'=> false,
                        'total_housing' => null,
                        'male_count'    => null,
                        'female_count'  => null,
                        'coed_count'    => null,
                    ];
                }

                $housing = $batch->housing;

                return [
                    'hei_id'        => $hei->id,
                    'hei_code'      => $hei->code,
                    'hei_name'      => $hei->name,
                    'status'        => $batch->status,
                    'has_submission'=> true,
                    'total_housing' => $housing->count(),
                    'male_count'    => $housing->filter(fn($h) => $h->male && !$h->female && !$h->coed)->count(),
                    'female_count'  => $housing->filter(fn($h) => $h->female && !$h->male && !$h->coed)->count(),
                    'coed_count'    => $housing->filter(fn($h) => $h->coed)->count(),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    /**
     * GET /admin/summary/dorm/{heiId}/evidence?year=XXXX
     */
    public function getAnnexLEvidence(Request $request, $heiId)
    {
        $selectedYear = $request->query('year');

        if (!$selectedYear) {
            return response()->json(['error' => 'Academic year is required', 'records' => []], 400);
        }

        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json(['error' => 'HEI not found', 'records' => []], 404);
        }

        $housing = AnnexLHousing::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $selectedYear)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->orderBy('housing_name', 'asc')->get();

        $records = $housing->map(fn($h) => [
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
        ])->values()->toArray();

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Students with Special Needs / PWD Statistics (Annex M)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * GET /admin/summary/special-needs-stats?year=XXXX
     *
     * Reads the Sub-Total rows (is_subtotal=true, subcategory='Sub-Total') for
     * categories A, B, and C, then extracts year_data[$selectedYear].
     */
    public function getAnnexMStatsData(Request $request)
    {
        $selectedYear = $request->query('year');

        $availableYears = AnnexMBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();

        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }

        $result = [];

        if ($selectedYear) {
            $heis = HEI::where('is_active', true)->orderBy('name')->get();

            // Load only the subtotal rows — no need to pull every subcategory row
            $batches = AnnexMBatch::where('academic_year', $selectedYear)
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

            $result = $heis->map(function ($hei) use ($batches, $selectedYear) {
                $batch = $batches->get($hei->id);

                if (!$batch) {
                    return [
                        'hei_id'                 => $hei->id,
                        'hei_code'               => $hei->code,
                        'hei_name'               => $hei->name,
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

                // Index subtotals by category for easy lookup
                $subtotals = $batch->statistics->keyBy('category');

                $extract = function (string $category, string $field) use ($subtotals, $selectedYear): int {
                    $row = $subtotals->get($category);
                    if (!$row || !is_array($row->year_data)) {
                        return 0;
                    }
                    return intval($row->year_data[$selectedYear][$field] ?? 0);
                };

                return [
                    'hei_id'                 => $hei->id,
                    'hei_code'               => $hei->code,
                    'hei_name'               => $hei->name,
                    'status'                 => $batch->status,
                    'has_submission'         => true,
                    'pwd_enrollment'         => $extract('A. Persons with Disabilities', 'enrollment'),
                    'pwd_graduates'          => $extract('A. Persons with Disabilities', 'graduates'),
                    'ip_enrollment'          => $extract('B. Indigenous People', 'enrollment'),
                    'ip_graduates'           => $extract('B. Indigenous People', 'graduates'),
                    'solo_parent_enrollment' => $extract('C. Dependents of Solo Parents / Solo Parents', 'enrollment'),
                    'solo_parent_graduates'  => $extract('C. Dependents of Solo Parents / Solo Parents', 'graduates'),
                ];
            })->toArray();
        }

        return response()->json([
            'data'           => $result,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }
}
