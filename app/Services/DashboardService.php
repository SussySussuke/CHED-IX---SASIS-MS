<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Shared dashboard statistics logic used by both Admin and SuperAdmin dashboards.
 */
class DashboardService
{
    public function getStats(string $selectedYear): array
    {
        return Cache::remember("admin_dashboard_stats_{$selectedYear}", CacheService::TTL_SHORT, function () use ($selectedYear) {
            return [
                'pendingReviews'   => $this->getPendingReviewsCount(),
                'completionRate'   => $this->getTotalCompletionPercentage($selectedYear),
                'enrollmentByType' => $this->getEnrollmentDistribution($selectedYear),
                'heisByType'       => $this->getHEITypeDistribution($selectedYear),
                'recentSubmissions'=> $this->getRecentSubmissions(),
                'topHEIs'          => $this->getTopPerformingHEIs($selectedYear, 5),
                'allHEIs'          => $this->getTopPerformingHEIs($selectedYear, 9999),
                'formCompletion'   => $this->getFormCompletionRates($selectedYear),
            ];
        });
    }

    public function getTotalAdmins(): int
    {
        return DB::table('users')->where('account_type', 'admin')->count();
    }

    public function getCurrentAcademicYear(): string
    {
        $currentYear  = (int) date('Y');
        $currentMonth = (int) date('n');

        return $currentMonth >= 8
            ? "{$currentYear}-" . ($currentYear + 1)
            : ($currentYear - 1) . "-{$currentYear}";
    }

    public function getAvailableAcademicYears(): array
    {
        $years = collect();

        foreach (FormConfigService::getAllFormTypes() as $config) {
            try {
                $table      = (new $config['model'])->getTable();
                $tableYears = DB::table($table)->select('academic_year')->distinct()->pluck('academic_year');
                $years      = $years->merge($tableYears);
            } catch (\Exception $e) {
                continue;
            }
        }

        $years->push($this->getCurrentAcademicYear());

        return $years->unique()->filter()->sort()->values()->toArray();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function getPendingReviewsCount(): int
    {
        $count = 0;

        foreach (FormConfigService::getAllFormTypes() as $config) {
            try {
                $table  = (new $config['model'])->getTable();
                $count += DB::table($table)->where('status', 'request')->count();
            } catch (\Exception $e) {
                continue;
            }
        }

        return $count;
    }

    private function getTotalCompletionPercentage(string $academicYear): float
    {
        $totalFormsPerHEI = FormConfigService::getTotalFormsCount();
        $cutoffDate       = $this->getAcademicYearCutoffDate($academicYear);

        $totalHEIs = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->count();

        if ($totalHEIs === 0) {
            return 0;
        }

        $totalPossible = $totalHEIs * $totalFormsPerHEI;
        $completed     = 0;

        foreach (FormConfigService::getAllFormTypes() as $config) {
            try {
                $table      = (new $config['model'])->getTable();
                $completed += DB::table($table)
                    ->where('academic_year', $academicYear)
                    ->whereIn('status', ['submitted', 'published'])
                    ->distinct('hei_id')
                    ->count('hei_id');
            } catch (\Exception $e) {
                continue;
            }
        }

        return round(($completed / $totalPossible) * 100, 1);
    }

    private function getEnrollmentDistribution(string $academicYear): array
    {
        $distribution = DB::table('summary')
            ->join('heis', 'summary.hei_id', '=', 'heis.id')
            ->where('summary.academic_year', $academicYear)
            ->whereIn('summary.status', ['submitted', 'published'])
            ->select('heis.type', DB::raw('SUM(summary.population_total) as total'))
            ->groupBy('heis.type')
            ->get();

        $result = ['SUC' => 0, 'LUC' => 0, 'Private' => 0];
        foreach ($distribution as $item) {
            $result[$item->type] = (int) $item->total;
        }

        return $result;
    }

    private function getHEITypeDistribution(string $academicYear): array
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);

        $distribution = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get();

        $result = ['SUC' => 0, 'LUC' => 0, 'Private' => 0];
        foreach ($distribution as $item) {
            $result[$item->type] = (int) $item->count;
        }

        return $result;
    }

    private function getRecentSubmissions(int $limit = 5): array
    {
        $submissions = collect();

        foreach (FormConfigService::getAllFormTypes() as $code => $config) {
            try {
                $table       = (new $config['model'])->getTable();
                $displayName = match($code) {
                    'SUMMARY'                     => 'Summary',
                    'MER1', 'MER2', 'MER3', 'MER4A' => $code,
                    default                       => "Annex {$code}",
                };

                $rows = DB::table($table)
                    ->join('heis', "{$table}.hei_id", '=', 'heis.id')
                    ->select(
                        "{$table}.id",
                        'heis.id as hei_id',
                        'heis.name as hei_name',
                        'heis.code as hei_code',
                        DB::raw("'{$displayName}' as annex"),
                        "{$table}.academic_year",
                        "{$table}.updated_at as submitted_at",
                        "{$table}.status"
                    )
                    ->get();

                $submissions = $submissions->merge($rows);
            } catch (\Exception $e) {
                continue;
            }
        }

        return $submissions
            ->sortByDesc('submitted_at')
            ->take($limit)
            ->map(fn($item) => [
                'id'            => $item->id,
                'hei_id'        => $item->hei_id,
                'hei_name'      => $item->hei_name,
                'hei_code'      => $item->hei_code,
                'annex'         => $item->annex,
                'academic_year' => $item->academic_year,
                'submitted_at'  => Carbon::parse($item->submitted_at)->diffForHumans(),
                'status'        => $item->status,
            ])
            ->values()
            ->toArray();
    }

    private function getTopPerformingHEIs(string $academicYear, int $limit = 5): array
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);
        $totalForms = FormConfigService::getTotalFormsCount();
        $allForms   = FormConfigService::getAllFormTypes();

        $heis = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->select('id', 'name', 'code', 'type')
            ->get();

        $performance = [];

        foreach ($heis as $hei) {
            $completed    = 0;
            $missingCount = 0;

            foreach ($allForms as $code => $config) {
                try {
                    $table = (new $config['model'])->getTable();

                    if (DB::table($table)
                        ->where('hei_id', $hei->id)
                        ->where('academic_year', $academicYear)
                        ->whereIn('status', ['submitted', 'published'])
                        ->exists()
                    ) {
                        $completed++;
                    } else {
                        $missingCount++;
                    }
                } catch (\Exception $e) {
                    $missingCount++;
                }
            }

            $performance[] = [
                'id'             => $hei->id,
                'name'           => $hei->name,
                'code'           => $hei->code,
                'type'           => $hei->type,
                'completionRate' => round(($completed / $totalForms) * 100, 1),
                'completedForms' => $completed,
                'totalForms'     => $totalForms,
                'missingForms'   => $missingCount,
            ];
        }

        return collect($performance)
            ->sortByDesc('completionRate')
            ->take($limit)
            ->values()
            ->toArray();
    }

    private function getFormCompletionRates(string $academicYear): array
    {
        $cutoffDate = $this->getAcademicYearCutoffDate($academicYear);

        $totalHEIs = DB::table('heis')
            ->where('is_active', true)
            ->where('established_at', '<=', $cutoffDate)
            ->count();

        if ($totalHEIs === 0) {
            return [];
        }

        $rates = [];

        foreach (FormConfigService::getAllFormTypes() as $code => $config) {
            try {
                $table  = (new $config['model'])->getTable();
                $count  = DB::table($table)
                    ->where('academic_year', $academicYear)
                    ->whereIn('status', ['submitted', 'published'])
                    ->distinct('hei_id')
                    ->count('hei_id');

                $rates[$code] = round(($count / $totalHEIs) * 100);
            } catch (\Exception $e) {
                $rates[$code] = 0;
            }
        }

        return $rates;
    }

    private function getAcademicYearCutoffDate(string $academicYear): string
    {
        $startYear = (int) explode('-', $academicYear)[0];

        $deadline = DB::table('settings')
            ->where('key', 'annual_submission_deadline')
            ->value('value');

        if ($deadline) {
            try {
                $d = Carbon::parse($deadline);
                return Carbon::create($startYear, $d->month, $d->day)->format('Y-m-d');
            } catch (\Exception $e) {
                // fall through
            }
        }

        return "{$startYear}-07-01";
    }
}
