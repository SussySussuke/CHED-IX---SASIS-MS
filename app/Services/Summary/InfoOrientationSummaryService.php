<?php

namespace App\Services\Summary;

use App\Models\HEI;
use App\Models\AnnexABatch;
use App\Models\AnnexAProgram;
use App\Models\AnnexBBatch;
use App\Models\AnnexBProgram;
use App\Models\ProgramCategoryOverride;

class InfoOrientationSummaryService
{
    public function __construct(
        private readonly CategoryKeywordMatcher $matcher
    ) {}

    // ── Aggregated summary ────────────────────────────────────────────────────

    public function getAvailableYears(): array
    {
        return AnnexABatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->merge(
                AnnexBBatch::whereIn('status', ['published', 'submitted', 'request'])
                    ->distinct()->pluck('academic_year')
            )
            ->unique()->sort()->values()->toArray();
    }

    public function getRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $annexABatches = AnnexABatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('hei_id');

        $annexBBatches = AnnexBBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($annexABatches, $annexBBatches, $year) {
            $batchA = $annexABatches->get($hei->id);
            $batchB = $annexBBatches->get($hei->id);

            $allPrograms = collect();
            if ($batchA) {
                $allPrograms = $allPrograms->merge($batchA->programs->map(fn($p) => [$p, 'annex_a']));
            }
            if ($batchB) {
                $allPrograms = $allPrograms->merge($batchB->programs->map(fn($p) => [$p, 'annex_b']));
            }

            if ($allPrograms->isEmpty()) {
                return $this->emptyRow($hei, $year);
            }

            $overrides = $this->loadOverrides($batchA, $batchB);

            $counts = array_fill_keys(array_keys(CategoryKeywordMatcher::INFO_ORIENTATION_KEYWORDS), [
                'activities' => 0, 'students' => 0,
            ]);
            $counts['uncategorized'] = ['activities' => 0, 'students' => 0];

            $totalActivities = 0;
            $totalStudents   = 0;
            $allTitles       = [];

            foreach ($allPrograms as [$program, $type]) {
                $overrideKey = "{$type}_{$program->id}";
                $override    = $overrides->get($overrideKey);
                $students    = ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0);
                $allTitles[] = $program->title;

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
                    $matched    = $this->matcher->matchInfoOrientation($searchText);

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
                'hei_id'                  => $hei->id,
                'hei_name'                => $hei->name,
                'hei_code'                => $hei->code,
                'hei_type'                => $hei->type,
                'status'                  => $status,
                'has_submission'          => true,
                'total_activities'        => $totalActivities,
                'total_students'          => $totalStudents,
                'services_activities_list' =>
                    implode(', ', array_slice($allTitles, 0, 3))
                    . (count($allTitles) > 3 ? '…' : ''),
            ];

            foreach ($counts as $cat => $data) {
                $row["{$cat}_activities"] = $data['activities'];
                $row["{$cat}_students"]   = $data['students'];
            }

            return $row;
        })->values()->toArray();
    }

    // ── Evidence drilldown ────────────────────────────────────────────────────

    public function getEvidence(int $heiId, string $category, string $year): array
    {
        $programsA = AnnexAProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get()->map(fn($p) => [$p, 'annex_a']);

        $programsB = AnnexBProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get()->map(fn($p) => [$p, 'annex_b']);

        $allPrograms = $programsA->merge($programsB);

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

            $assignedCategories = !empty($manualCategories)
                ? $manualCategories
                : $this->resolveCategories(
                    strtolower($program->title . ' ' . ($program->target_group ?? ''))
                );

            if (!$this->shouldInclude($category, $assignedCategories)) {
                continue;
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

        usort($records, fn($a, $b) =>
            strcmp($b['implementation_date'] ?? '', $a['implementation_date'] ?? '')
        );

        return $records;
    }

    // ── Category override ─────────────────────────────────────────────────────

    public function updateCategory(string $type, int $programId, ?array $categories, int $adminId): void
    {
        if (empty($categories)) {
            ProgramCategoryOverride::where('program_type', $type)
                ->where('program_id', $programId)
                ->delete();
            return;
        }

        ProgramCategoryOverride::updateOrCreate(
            ['program_type' => $type, 'program_id' => $programId],
            [
                'manual_categories' => $categories,
                'overridden_by'     => $adminId,
                'overridden_at'     => now(),
            ]
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function validCategories(): array
    {
        return array_merge(
            array_keys(CategoryKeywordMatcher::INFO_ORIENTATION_KEYWORDS),
            ['uncategorized', 'total']
        );
    }

    private function resolveCategories(string $searchText): array
    {
        $matched = $this->matcher->matchInfoOrientation($searchText);
        return empty($matched) ? ['uncategorized'] : $matched;
    }

    private function shouldInclude(string $category, array $assigned): bool
    {
        return match($category) {
            'total'       => true,
            'uncategorized' => in_array('uncategorized', $assigned, true),
            default       => in_array($category, $assigned, true),
        };
    }

    private function loadOverrides(?AnnexABatch $batchA, ?AnnexBBatch $batchB)
    {
        $programIds = [
            'annex_a' => $batchA ? $batchA->programs->pluck('id')->toArray() : [],
            'annex_b' => $batchB ? $batchB->programs->pluck('id')->toArray() : [],
        ];

        return ProgramCategoryOverride::where(function ($q) use ($programIds) {
            foreach ($programIds as $type => $ids) {
                if (!empty($ids)) {
                    $q->orWhere(function ($q2) use ($type, $ids) {
                        $q2->where('program_type', $type)->whereIn('program_id', $ids);
                    });
                }
            }
        })->get()->keyBy(fn($o) => "{$o->program_type}_{$o->program_id}");
    }

    private function emptyRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'                   => $hei->id,
            'hei_name'                 => $hei->name,
            'hei_code'                 => $hei->code,
            'hei_type'                 => $hei->type,
            'status'                   => 'not_submitted',
            'has_submission'           => false,
            'total_activities'         => 0,
            'total_students'           => 0,
            'services_activities_list' => '',
            'uncategorized_activities' => 0,
            'uncategorized_students'   => 0,
        ];

        foreach (array_keys(CategoryKeywordMatcher::INFO_ORIENTATION_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }
}
