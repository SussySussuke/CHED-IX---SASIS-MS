<?php

namespace App\Services\Summary;

use App\Models\HEI;
use App\Models\AnnexBBatch;
use App\Models\AnnexBProgram;
use App\Models\GuidanceCounsellingCategoryOverride;

class GuidanceCounsellingSummaryService
{
    public function __construct(
        private readonly CategoryKeywordMatcher $matcher
    ) {}

    public function getAvailableYears(): array
    {
        return AnnexBBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()->pluck('academic_year')
            ->sort()->values()->toArray();
    }

    public function getRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $batches = AnnexBBatch::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('programs')
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($batches, $year) {
            $batch = $batches->get($hei->id);

            if (!$batch || $batch->programs->isEmpty()) {
                return $this->emptyRow($hei, $year);
            }

            $programIds = $batch->programs->pluck('id')->toArray();
            $overrides  = GuidanceCounsellingCategoryOverride::whereIn('program_id', $programIds)
                ->get()->keyBy('program_id');

            $counts = array_fill_keys(
                array_keys(CategoryKeywordMatcher::GUIDANCE_COUNSELLING_KEYWORDS),
                ['activities' => 0, 'students' => 0]
            );
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
                    $matched    = $this->matcher->matchGuidanceCounselling($searchText);

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
                'hei_type'         => $hei->type,
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
        })->values()->toArray();
    }

    public function getEvidence(int $heiId, string $category, string $year): array
    {
        $programs = AnnexBProgram::whereHas('batch', fn($q) =>
            $q->where('hei_id', $heiId)
              ->where('academic_year', $year)
              ->whereIn('status', ['published', 'submitted', 'request'])
        )->get();

        $overrides = GuidanceCounsellingCategoryOverride::whereIn('program_id', $programs->pluck('id')->toArray())
            ->get()->keyBy('program_id');

        $records = [];

        foreach ($programs as $program) {
            $override         = $overrides->get($program->id);
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

    public function updateCategory(int $programId, ?array $categories, int $adminId): void
    {
        if (empty($categories)) {
            GuidanceCounsellingCategoryOverride::where('program_id', $programId)->delete();
            return;
        }

        GuidanceCounsellingCategoryOverride::updateOrCreate(
            ['program_id' => $programId],
            [
                'manual_categories' => $categories,
                'overridden_by'     => $adminId,
                'overridden_at'     => now(),
            ]
        );
    }

    public function validCategories(): array
    {
        return array_merge(
            array_keys(CategoryKeywordMatcher::GUIDANCE_COUNSELLING_KEYWORDS),
            ['others', 'total']
        );
    }

    private function resolveCategories(string $searchText): array
    {
        $matched = $this->matcher->matchGuidanceCounselling($searchText);
        return empty($matched) ? ['others'] : $matched;
    }

    private function shouldInclude(string $category, array $assigned): bool
    {
        return match($category) {
            'total'  => true,
            default  => in_array($category, $assigned, true),
        };
    }

    private function emptyRow(HEI $hei, string $year): array
    {
        $row = [
            'hei_id'            => $hei->id,
            'hei_name'          => $hei->name,
            'hei_code'          => $hei->code,
            'hei_type'          => $hei->type,
            'status'            => 'not_submitted',
            'has_submission'    => false,
            'total_activities'  => 0,
            'total_students'    => 0,
            'others_titles'     => '',
            'others_activities' => 0,
            'others_students'   => 0,
        ];

        foreach (array_keys(CategoryKeywordMatcher::GUIDANCE_COUNSELLING_KEYWORDS) as $cat) {
            $row["{$cat}_activities"] = 0;
            $row["{$cat}_students"]   = 0;
        }

        return $row;
    }
}
