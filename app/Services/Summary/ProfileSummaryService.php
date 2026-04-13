<?php

namespace App\Services\Summary;

use App\Models\HEI;
use App\Models\Summary;

class ProfileSummaryService
{
    /**
     * Returns available years sourced from submitted Summary records.
     */
    public function getAvailableYears(): array
    {
        return Summary::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values()
            ->toArray();
    }

    /**
     * Returns one row per active HEI for the given academic year.
     * Rows for HEIs without a submission include null fields and status='not_submitted'.
     *
     * @param  bool $fullFields  true = include all profile fields (for the Inertia index page)
     *                           false = minimal fields only (for the JSON comparison fetch)
     */
    public function getRows(string $year, bool $fullFields = false): array
    {
        $heis = HEI::where('is_active', true)->orderBy('name')->get();

        $summaryData = Summary::where('academic_year', $year)
            ->whereIn('status', ['published', 'submitted', 'request'])
            ->get()
            ->keyBy('hei_id');

        return $heis->map(function ($hei) use ($summaryData, $year, $fullFields) {
            $summary = $summaryData->get($hei->id);

            $base = [
                'hei_id'               => $hei->id,
                'hei_code'             => $hei->abbreviation,
                'hei_name'             => $hei->name,
                'hei_type'             => $hei->type,
                'academic_year'        => $year,
                'population_male'      => $summary?->population_male,
                'population_female'    => $summary?->population_female,
                'population_intersex'  => $summary?->population_intersex,
                'population_total'     => $summary?->population_total,
                'status'               => $summary?->status ?? 'not_submitted',
            ];

            if ($fullFields && $summary) {
                $base['id']                    = $summary->id;
                $base['submitted_org_chart']   = $summary->submitted_org_chart;
                $base['hei_website']           = $summary->hei_website;
                $base['sas_website']           = $summary->sas_website;
                $base['social_media_contacts'] = $summary->social_media_contacts
                    ? implode(', ', $summary->social_media_contacts)
                    : '';
                $base['student_handbook']      = $summary->student_handbook;
                $base['student_publication']   = $summary->student_publication;
                $base['submitted_at']          = $summary->created_at->format('Y-m-d H:i:s');
                $base['has_submission']        = true;
            } elseif ($fullFields) {
                $base['id']                    = null;
                $base['submitted_org_chart']   = null;
                $base['hei_website']           = null;
                $base['sas_website']           = null;
                $base['social_media_contacts'] = '';
                $base['student_handbook']      = null;
                $base['student_publication']   = null;
                $base['submitted_at']          = null;
                $base['has_submission']        = false;
            }

            return $base;
        })->values()->toArray();
    }
}
