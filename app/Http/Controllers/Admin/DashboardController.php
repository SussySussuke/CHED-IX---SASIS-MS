<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Services\CacheService;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the Admin dashboard
     */
    public function index(Request $request)
    {
        $selectedYear = $request->get('year', $this->getCurrentAcademicYear());
        $academicYears = $this->getAvailableAcademicYears();

        // Cache admin dashboard stats for 5 minutes
        $cacheKey = "admin_dashboard_stats_{$selectedYear}";
        
        $stats = Cache::remember($cacheKey, CacheService::TTL_SHORT, function () use ($selectedYear) {
            return [
                'pendingReviews' => $this->getPendingReviewsCount(),
                'completionRate' => $this->getTotalCompletionPercentage($selectedYear),
                'enrollmentByType' => $this->getEnrollmentDistribution($selectedYear),
                'heisByType' => $this->getHEITypeDistribution($selectedYear),
                'recentSubmissions' => $this->getRecentSubmissions(),
                'topHEIs' => $this->getTopPerformingHEIs($selectedYear, 5),
                'allHEIs' => $this->getTopPerformingHEIs($selectedYear, 9999),
                'formCompletion' => $this->getFormCompletionRates($selectedYear),
            ];
        });

        return inertia('Admin/Dashboard', [
            'academicYears' => $academicYears,
            'selectedYear' => $selectedYear,
            'stats' => $stats,
        ]);
    }

    /**
     * Get count of all submissions with status = 'request' across all years
     */
    private function getPendingReviewsCount()
    {
        $count = 0;

        // Count from summary
        $count += DB::table('summary')
            ->where('status', 'request')
            ->count();

        // Count from all annex tables
        $tables = [
            'annex_a_batches',
            'annex_b_batches',
            'annex_c_batches',
            'annex_d_submissions',
            'annex_e_batches',
            'annex_f_batches',
            'annex_g_submissions',
            'annex_h_batches',
            'annex_i_batches',
            'annex_j_batches',
            'annex_k_batches',
            'annex_l_batches',
            'annex_m_batches',
            'annex_n_batches',
            'annex_o_batches',
        ];

        foreach ($tables as $table) {
            try {
                $count += DB::table($table)
                    ->where('status', 'request')
                    ->count();
            } catch (\Exception $e) {
                continue;
            }
        }

        return $count;
    }

    /**
     * Calculate total completion percentage for selected academic year
     * Formula: (Total completed forms across all HEIs / (Total HEIs × 16)) × 100
     */
    private function getTotalCompletionPercentage($academicYear)
    {
        // Total number of forms (Summary + 15 Annexes = 16)
        $totalFormsPerHEI = 16;

        // Get active HEIs established before the academic year
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);
        $totalHEIs = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->count();

        if ($totalHEIs === 0) {
            return 0;
        }

        $totalPossibleForms = $totalHEIs * $totalFormsPerHEI;
        $completedForms = 0;

        // Count completed Summary submissions
        $completedForms += DB::table('summary')
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published'])
            ->distinct('hei_id')
            ->count('hei_id');

        // Count completed Annex submissions
        $tables = [
            'annex_a_batches',
            'annex_b_batches',
            'annex_c_batches',
            'annex_d_submissions',
            'annex_e_batches',
            'annex_f_batches',
            'annex_g_submissions',
            'annex_h_batches',
            'annex_i_batches',
            'annex_j_batches',
            'annex_k_batches',
            'annex_l_batches',
            'annex_m_batches',
            'annex_n_batches',
            'annex_o_batches',
        ];

        foreach ($tables as $table) {
            try {
                $completedForms += DB::table($table)
                    ->where('academic_year', $academicYear)
                    ->whereIn('status', ['submitted', 'published'])
                    ->distinct('hei_id')
                    ->count('hei_id');
            } catch (\Exception $e) {
                continue;
            }
        }

        return round(($completedForms / $totalPossibleForms) * 100, 1);
    }

    /**
     * Get enrollment distribution by HEI type for selected academic year
     * Data comes from Summary table's population_total field
     */
    private function getEnrollmentDistribution($academicYear)
    {
        $distribution = DB::table('summary')
            ->join('heis', 'summary.hei_id', '=', 'heis.id')
            ->where('summary.academic_year', $academicYear)
            ->whereIn('summary.status', ['submitted', 'published'])
            ->select('heis.type', DB::raw('SUM(summary.population_total) as total'))
            ->groupBy('heis.type')
            ->get();

        $result = [
            'SUC' => 0,
            'LUC' => 0,
            'Private' => 0,
        ];

        foreach ($distribution as $item) {
            $result[$item->type] = (int) $item->total;
        }

        return $result;
    }

    /**
     * Get HEI type distribution for selected academic year
     * Only include HEIs established before the academic year starts
     */
    private function getHEITypeDistribution($academicYear)
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);

        $distribution = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get();

        $result = [
            'SUC' => 0,
            'LUC' => 0,
            'Private' => 0,
        ];

        foreach ($distribution as $item) {
            $result[$item->type] = (int) $item->count;
        }

        return $result;
    }

    /**
     * Get cutoff date for academic year based on annual submission deadline
     * Format: For AY 2024-2025, get the deadline month/day and apply to start year (2024)
     */
    private function getAcademicYearCutoffDate($academicYear)
    {
        // Get the start year from academic year string (e.g., "2024-2025" -> 2024)
        $startYear = (int) explode('-', $academicYear)[0];

        // Get annual submission deadline from settings
        $deadline = DB::table('settings')
            ->where('key', 'annual_submission_deadline')
            ->value('value');

        if ($deadline) {
            try {
                $deadlineDate = Carbon::parse($deadline);
                // Apply the month and day to the start year
                return Carbon::create($startYear, $deadlineDate->month, $deadlineDate->day)->format('Y-m-d');
            } catch (\Exception $e) {
                // Fallback to July 1st if parsing fails
            }
        }

        // Default fallback: July 1st of the start year
        return "$startYear-07-01";
    }

    /**
     * Get recent submissions across all forms and all years
     */
    private function getRecentSubmissions($limit = 5)
    {
        $submissions = collect();

        // Get from Summary
        $summarySubmissions = DB::table('summary')
            ->join('heis', 'summary.hei_id', '=', 'heis.id')
            ->select(
                'summary.id',
                'heis.id as hei_id',
                'heis.name as hei_name',
                'heis.code as hei_code',
                DB::raw("'Summary' as annex"),
                'summary.academic_year',
                'summary.updated_at as submitted_at',
                'summary.status'
            )
            ->get();

        $submissions = $submissions->merge($summarySubmissions);

        // Get from all Annex tables
        $annexTables = [
            ['table' => 'annex_a_batches', 'name' => 'Annex A'],
            ['table' => 'annex_b_batches', 'name' => 'Annex B'],
            ['table' => 'annex_c_batches', 'name' => 'Annex C'],
            ['table' => 'annex_d_submissions', 'name' => 'Annex D'],
            ['table' => 'annex_e_batches', 'name' => 'Annex E'],
            ['table' => 'annex_f_batches', 'name' => 'Annex F'],
            ['table' => 'annex_g_submissions', 'name' => 'Annex G'],
            ['table' => 'annex_h_batches', 'name' => 'Annex H'],
            ['table' => 'annex_i_batches', 'name' => 'Annex I'],
            ['table' => 'annex_j_batches', 'name' => 'Annex J'],
            ['table' => 'annex_k_batches', 'name' => 'Annex K'],
            ['table' => 'annex_l_batches', 'name' => 'Annex L'],
            ['table' => 'annex_m_batches', 'name' => 'Annex M'],
            ['table' => 'annex_n_batches', 'name' => 'Annex N'],
            ['table' => 'annex_o_batches', 'name' => 'Annex O'],
        ];

        foreach ($annexTables as $annex) {
            try {
                $annexSubmissions = DB::table($annex['table'])
                    ->join('heis', $annex['table'] . '.hei_id', '=', 'heis.id')
                    ->select(
                        $annex['table'] . '.id',
                        'heis.id as hei_id',
                        'heis.name as hei_name',
                        'heis.code as hei_code',
                        DB::raw("'" . $annex['name'] . "' as annex"),
                        $annex['table'] . '.academic_year',
                        $annex['table'] . '.updated_at as submitted_at',
                        $annex['table'] . '.status'
                    )
                    ->get();

                $submissions = $submissions->merge($annexSubmissions);
            } catch (\Exception $e) {
                continue;
            }
        }

        // Sort by submitted_at descending and take limit
        return $submissions
            ->sortByDesc('submitted_at')
            ->take($limit)
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'hei_id' => $item->hei_id,
                    'hei_name' => $item->hei_name,
                    'hei_code' => $item->hei_code,
                    'annex' => $item->annex,
                    'academic_year' => $item->academic_year,
                    'submitted_at' => Carbon::parse($item->submitted_at)->diffForHumans(),
                    'status' => $item->status,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get top performing HEIs for selected academic year
     * Based on completion rate (completed forms / 16 total forms)
     */
    private function getTopPerformingHEIs($academicYear, $limit = 5)
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);
        
        $heis = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->select('id', 'name', 'code', 'type')
            ->get();

        $heiPerformance = [];

        foreach ($heis as $hei) {
            $completedForms = 0;
            $totalForms = 16;

            // Check Summary
            $hasSummary = DB::table('summary')
                ->where('hei_id', $hei->id)
                ->where('academic_year', $academicYear)
                ->whereIn('status', ['submitted', 'published'])
                ->exists();

            if ($hasSummary) {
                $completedForms++;
            }

            // Check all Annexes
            $tables = [
                'annex_a_batches',
                'annex_b_batches',
                'annex_c_batches',
                'annex_d_submissions',
                'annex_e_batches',
                'annex_f_batches',
                'annex_g_submissions',
                'annex_h_batches',
                'annex_i_batches',
                'annex_j_batches',
                'annex_k_batches',
                'annex_l_batches',
                'annex_m_batches',
                'annex_n_batches',
                'annex_o_batches',
            ];

            foreach ($tables as $table) {
                try {
                    $hasAnnex = DB::table($table)
                        ->where('hei_id', $hei->id)
                        ->where('academic_year', $academicYear)
                        ->whereIn('status', ['submitted', 'published'])
                        ->exists();

                    if ($hasAnnex) {
                        $completedForms++;
                    }
                } catch (\Exception $e) {
                    continue;
                }
            }

            $completionRate = round(($completedForms / $totalForms) * 100, 1);

            $heiPerformance[] = [
                'id' => $hei->id,
                'name' => $hei->name,
                'code' => $hei->code,
                'type' => $hei->type,
                'completionRate' => $completionRate,
                'completedForms' => $completedForms,
                'totalForms' => $totalForms,
            ];
        }

        // Sort by completion rate descending and take top limit
        return collect($heiPerformance)
            ->sortByDesc('completionRate')
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Get form completion rates for selected academic year
     * Shows percentage of HEIs that completed each form
     */
    private function getFormCompletionRates($academicYear)
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);
        
        $totalHEIs = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->count();

        if ($totalHEIs === 0) {
            return [];
        }

        $forms = [
            'Summary' => 'summary',
            'Annex A' => 'annex_a_batches',
            'Annex B' => 'annex_b_batches',
            'Annex C' => 'annex_c_batches',
            'Annex D' => 'annex_d_submissions',
            'Annex E' => 'annex_e_batches',
            'Annex F' => 'annex_f_batches',
            'Annex G' => 'annex_g_submissions',
            'Annex H' => 'annex_h_batches',
            'Annex I' => 'annex_i_batches',
            'Annex J' => 'annex_j_batches',
            'Annex K' => 'annex_k_batches',
            'Annex L' => 'annex_l_batches',
            'Annex M' => 'annex_m_batches',
            'Annex N' => 'annex_n_batches',
            'Annex O' => 'annex_o_batches',
        ];

        $completionRates = [];

        foreach ($forms as $formName => $table) {
            try {
                $completedCount = DB::table($table)
                    ->where('academic_year', $academicYear)
                    ->whereIn('status', ['submitted', 'published'])
                    ->distinct('hei_id')
                    ->count('hei_id');

                $completionRates[$formName] = round(($completedCount / $totalHEIs) * 100);
            } catch (\Exception $e) {
                $completionRates[$formName] = 0;
            }
        }

        return $completionRates;
    }

    /**
     * Get current academic year (format: YYYY-YYYY)
     */
    private function getCurrentAcademicYear()
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
     * Get available academic years from existing submissions
     */
    private function getAvailableAcademicYears()
    {
        $years = collect();

        // Get years from Summary
        $summaryYears = DB::table('summary')
            ->select('academic_year')
            ->distinct()
            ->pluck('academic_year');

        $years = $years->merge($summaryYears);

        // Get years from annex batches
        $tables = [
            'annex_a_batches',
            'annex_b_batches',
            'annex_c_batches',
            'annex_d_submissions',
            'annex_e_batches',
            'annex_f_batches',
            'annex_g_submissions',
            'annex_h_batches',
            'annex_i_batches',
            'annex_j_batches',
            'annex_k_batches',
            'annex_l_batches',
            'annex_m_batches',
            'annex_n_batches',
            'annex_o_batches',
        ];

        foreach ($tables as $table) {
            try {
                $tableYears = DB::table($table)
                    ->select('academic_year')
                    ->distinct()
                    ->pluck('academic_year');

                $years = $years->merge($tableYears);
            } catch (\Exception $e) {
                continue;
            }
        }

        // Always include current academic year
        $currentYear = $this->getCurrentAcademicYear();
        $years->push($currentYear);

        return $years->unique()
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }
}
