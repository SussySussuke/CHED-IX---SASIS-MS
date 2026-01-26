<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Service for managing academic year logic
 */
class AcademicYearService
{
    /**
     * Get current academic year (format: YYYY-YYYY)
     */
    public static function getCurrentAcademicYear(): string
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        // Academic year typically starts in August/September
        if ($currentMonth >= 8) {
            return $currentYear . '-' . ($currentYear + 1);
        } else {
            return ($currentYear - 1) . '-' . $currentYear;
        }
    }

    /**
     * Get all available academic years from existing submissions
     * Cached for performance
     */
    public static function getAvailableAcademicYears(): array
    {
        return Cache::remember(
            CacheService::academicYearsKey(),
            CacheService::TTL_MEDIUM,
            function () {
                $years = collect();

                // Get years from Summary
                $summaryYears = DB::table('summary')
                    ->select('academic_year')
                    ->distinct()
                    ->pluck('academic_year');

                $years = $years->merge($summaryYears);

                // Get years from annex batches
                $tables = [
                    'annex_a_batches', 'annex_b_batches', 'annex_c_batches',
                    'annex_d_submissions', 'annex_e_batches', 'annex_f_batches',
                    'annex_g_submissions', 'annex_h_batches', 'annex_i_batches',
                    'annex_j_batches', 'annex_k_batches', 'annex_l_batches',
                    'annex_m_batches', 'annex_n_batches', 'annex_o_batches',
                ];

                foreach ($tables as $table) {
                    try {
                        $tableYears = DB::table($table)
                            ->select('academic_year')
                            ->distinct()
                            ->pluck('academic_year');

                        $years = $years->merge($tableYears);
                    } catch (\Exception $e) {
                        // Table might not exist yet, skip
                        continue;
                    }
                }

                // Always include current academic year
                $currentYear = self::getCurrentAcademicYear();
                $years->push($currentYear);

                return $years->unique()
                    ->filter()
                    ->sort()
                    ->values()
                    ->toArray();
            }
        );
    }

    /**
     * Get available academic years for a specific HEI
     */
    public static function getHeiAcademicYears(int $heiId): array
    {
        return Cache::remember(
            CacheService::heiAcademicYearsKey($heiId),
            CacheService::TTL_MEDIUM,
            function () use ($heiId) {
                $years = collect();

                // Get years from Summary
                $summaryYears = DB::table('summary')
                    ->where('hei_id', $heiId)
                    ->select('academic_year')
                    ->distinct()
                    ->pluck('academic_year');

                $years = $years->merge($summaryYears);

                // Get years from annex batches
                $tables = [
                    'annex_a_batches', 'annex_b_batches', 'annex_c_batches',
                    'annex_d_submissions', 'annex_e_batches', 'annex_f_batches',
                    'annex_g_submissions', 'annex_h_batches', 'annex_i_batches',
                    'annex_j_batches', 'annex_k_batches', 'annex_l_batches',
                    'annex_m_batches', 'annex_n_batches', 'annex_o_batches',
                ];

                foreach ($tables as $table) {
                    try {
                        $tableYears = DB::table($table)
                            ->where('hei_id', $heiId)
                            ->select('academic_year')
                            ->distinct()
                            ->pluck('academic_year');

                        $years = $years->merge($tableYears);
                    } catch (\Exception $e) {
                        continue;
                    }
                }

                // Always include current academic year
                $currentYear = self::getCurrentAcademicYear();
                $years->push($currentYear);

                return $years->unique()
                    ->filter()
                    ->sort()
                    ->values()
                    ->toArray();
            }
        );
    }
}
