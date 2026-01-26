<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Centralized caching service for the application
 * Handles cache key generation and TTL management
 */
class CacheService
{
    // Cache TTL constants (in seconds)
    const TTL_SHORT = 300;       // 5 minutes - frequently changing data
    const TTL_MEDIUM = 1800;     // 30 minutes - moderately changing data
    const TTL_LONG = 3600;       // 1 hour - rarely changing data
    const TTL_STATIC = 86400;    // 24 hours - static configuration

    /**
     * Cache keys
     */
    public static function userHeiKey($userId): string
    {
        return "user_hei_{$userId}";
    }

    public static function dashboardChecklistKey($heiId, $academicYear): string
    {
        return "dashboard_checklist_{$heiId}_{$academicYear}";
    }

    public static function dashboardStatsKey($heiId, $academicYear): string
    {
        return "dashboard_stats_{$heiId}_{$academicYear}";
    }

    public static function dashboardActivitiesKey($heiId, $academicYear): string
    {
        return "dashboard_activities_{$heiId}_{$academicYear}";
    }

    public static function academicYearsKey(): string
    {
        return "academic_years_all";
    }

    public static function heiAcademicYearsKey($heiId): string
    {
        return "academic_years_hei_{$heiId}";
    }

    public static function submissionsListKey($heiId): string
    {
        return "submissions_list_{$heiId}";
    }

    public static function batchDataKey($annexType, $batchId): string
    {
        return "batch_data_{$annexType}_{$batchId}";
    }

    /**
     * Clear HEI-specific caches when data is updated
     */
    public static function clearHeiCaches($heiId, $academicYear = null): void
    {
        // Clear academic years cache
        Cache::forget(self::academicYearsKey());
        Cache::forget(self::heiAcademicYearsKey($heiId));

        // Clear specific year if provided
        if ($academicYear) {
            Cache::forget(self::dashboardChecklistKey($heiId, $academicYear));
            Cache::forget(self::dashboardStatsKey($heiId, $academicYear));
            Cache::forget(self::dashboardActivitiesKey($heiId, $academicYear));
        } else {
            // Clear all years - iterate through possible years since file cache doesn't support tags
            $currentYear = date('Y');
            for ($year = 1994; $year <= $currentYear + 1; $year++) {
                $academicYear = $year . '-' . ($year + 1);
                Cache::forget(self::dashboardChecklistKey($heiId, $academicYear));
                Cache::forget(self::dashboardStatsKey($heiId, $academicYear));
                Cache::forget(self::dashboardActivitiesKey($heiId, $academicYear));
            }
        }
        
        // Clear submissions list
        Cache::forget(self::submissionsListKey($heiId));
    }

    /**
     * Clear batch-specific cache
     */
    public static function clearBatchCache($annexType, $batchId): void
    {
        Cache::forget(self::batchDataKey($annexType, $batchId));
    }

    /**
     * Clear all submission-related caches for an HEI
     */
    public static function clearSubmissionCaches($heiId): void
    {
        Cache::forget(self::submissionsListKey($heiId));
        self::clearHeiCaches($heiId);
    }
}
