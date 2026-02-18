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
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

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
}
