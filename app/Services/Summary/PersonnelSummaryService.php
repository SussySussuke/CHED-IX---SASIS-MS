<?php

namespace App\Services\Summary;

use App\Models\HEI;
use App\Models\MER2Submission;
use App\Models\MER1Submission;
use App\Models\PersonnelCategoryOverride;

class PersonnelSummaryService
{
    public function __construct(
        private readonly CategoryKeywordMatcher $matcher
    ) {}

    // ── Aggregated summary ────────────────────────────────────────────────────

    public function getAvailableYears(): array
    {
        return MER2Submission::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values()
            ->toArray();
    }

    public function getRows(string $year): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $mer2Submissions = MER2Submission::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('personnel')
            ->get()
            ->keyBy('hei_id');

        $mer1Submissions = MER1Submission::where('academic_year', $year)
            ->whereIn('status', ['approved', 'published', 'submitted', 'request'])
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($mer2Submissions, $mer1Submissions, $year) {
            $submission  = $mer2Submissions->get($hei->id);
            $sasHeadName = $mer1Submissions->get($hei->id)?->sas_head_name;

            if (!$submission) {
                return $this->emptyRow($hei, $year, $sasHeadName);
            }

            $personnelIds = $submission->personnel->pluck('id')->toArray();
            $overrides    = PersonnelCategoryOverride::whereIn('personnel_id', $personnelIds)
                ->get()
                ->keyBy('personnel_id');

            $counts         = array_fill_keys(array_keys(CategoryKeywordMatcher::PERSONNEL_ROLE_KEYWORDS), 0);
            $counts['uncategorized'] = 0;
            $totalPersonnel = 0;

            foreach ($submission->personnel as $person) {
                $override = $overrides->get($person->id);
                $totalPersonnel++;

                if ($override && !empty($override->manual_categories)) {
                    foreach ($override->manual_categories as $cat) {
                        if (array_key_exists($cat, $counts)) {
                            $counts[$cat]++;
                        }
                    }
                } else {
                    if (empty($person->position_designation)) {
                        $counts['uncategorized']++;
                        continue;
                    }

                    $matched = $this->matcher->matchPersonnel($person->position_designation);

                    if (empty($matched)) {
                        $counts['uncategorized']++;
                    } else {
                        foreach ($matched as $cat) {
                            $counts[$cat]++;
                        }
                    }
                }
            }

            return array_merge([
                'hei_id'          => $hei->id,
                'hei_code'        => $hei->code,
                'hei_name'        => $hei->name,
                'hei_type'        => $hei->type,
                'status'          => $submission->status,
                'has_submission'  => true,
                'sas_head_name'   => $sasHeadName,
                'total_personnel' => $totalPersonnel,
            ], $counts);
        })->values()->toArray();
    }

    // ── Evidence drilldown ────────────────────────────────────────────────────

    public function getEvidence(int $heiId, string $category, string $year): array
    {
        $submission = MER2Submission::where('hei_id', $heiId)
            ->where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->with('personnel')
            ->first();

        if (!$submission) {
            return [];
        }

        $personnelIds = $submission->personnel->pluck('id')->toArray();
        $overrides    = PersonnelCategoryOverride::whereIn('personnel_id', $personnelIds)
            ->get()
            ->keyBy('personnel_id');

        $records = [];

        foreach ($submission->personnel as $person) {
            $override         = $overrides->get($person->id);
            $manualCategories = $override?->manual_categories ?? [];

            $assignedCategories = !empty($manualCategories)
                ? $manualCategories
                : $this->resolvePersonnelCategories($person->position_designation ?? '');

            if (!$this->shouldInclude($category, $assignedCategories)) {
                continue;
            }

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

        return $records;
    }

    // ── Category override ─────────────────────────────────────────────────────

    public function updateCategory(int $personnelId, ?array $categories, int $adminId): void
    {
        if (empty($categories)) {
            PersonnelCategoryOverride::where('personnel_id', $personnelId)->delete();
            return;
        }

        PersonnelCategoryOverride::updateOrCreate(
            ['personnel_id' => $personnelId],
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
        return array_merge(array_keys(CategoryKeywordMatcher::PERSONNEL_ROLE_KEYWORDS), ['uncategorized', 'total']);
    }

    private function resolvePersonnelCategories(string $position): array
    {
        if (empty($position)) {
            return ['uncategorized'];
        }
        $matched = $this->matcher->matchPersonnel($position);
        return empty($matched) ? ['uncategorized'] : $matched;
    }

    private function shouldInclude(string $category, array $assigned): bool
    {
        if ($category === 'total') {
            return true;
        }
        return in_array($category, $assigned, true);
    }

    private function emptyRow(HEI $hei, string $year, ?string $sasHeadName): array
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

        foreach (array_keys(CategoryKeywordMatcher::PERSONNEL_ROLE_KEYWORDS) as $cat) {
            $row[$cat] = 0;
        }

        return $row;
    }
}
