<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

abstract class BaseAnnexController extends Controller
{
    /**
     * Get current academic year
     */
    protected function getCurrentAcademicYear(): string
    {
        $currentYear = date('Y');
        return $currentYear . '-' . ($currentYear + 1);
    }

    /**
     * Generate available academic years from 1994 to current year
     */
    protected function getAvailableYears(): array
    {
        $currentYear = date('Y');
        $availableYears = [];
        for ($year = 1994; $year <= $currentYear; $year++) {
            $availableYears[] = $year . '-' . ($year + 1);
        }
        return $availableYears;
    }

    /**
     * Get selectable years (filter out published submissions)
     */
    protected function getSelectableYears($model, int $heiId): array
    {
        $availableYears = $this->getAvailableYears();

        $existingBatches = $model::where('hei_id', $heiId)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->get()
            ->keyBy('academic_year');

        $selectableYears = array_filter($availableYears, function($year) use ($existingBatches) {
            $batch = $existingBatches->get($year);
            return !$batch || $batch->status !== 'published';
        });

        return array_values($selectableYears);
    }

    /**
     * Validate academic year is not in the future
     */
    protected function validateAcademicYear(string $academicYear): ?array
    {
        $currentYear = date('Y');
        $selectedYear = (int) substr($academicYear, 0, 4);

        if ($selectedYear > $currentYear) {
            return [
                'academic_year' => 'Cannot submit for future academic years.'
            ];
        }

        return null;
    }

    /**
     * Get the last N academic years (including current)
     * Returns array of academic year strings in descending order
     * Example: ['2025-2026', '2024-2025', '2023-2024']
     */
    protected function getLastNAcademicYears(int $count = 3): array
    {
        $currentYear = date('Y');
        $years = [];

        for ($i = 0; $i < $count; $i++) {
            $year = $currentYear - $i;
            $years[] = $year . '-' . ($year + 1);
        }

        return $years;
    }

    /**
     * Generate column names for academic year data
     * Example: 'ay_2025_2026_enrollment'
     */
    protected function getAcademicYearColumnName(string $academicYear, string $suffix): string
    {
        $normalized = str_replace('-', '_', $academicYear);
        return 'ay_' . $normalized . '_' . $suffix;
    }

    /**
     * Get authenticated user's HEI ID
     */
    protected function getHeiId(): int
    {
        return Auth::user()->hei_id;
    }

    /**
     * Check for existing batch/submission
     */
    protected function getExistingRecord($model, string $academicYear, int $heiId)
    {
        return $model::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();
    }

    /**
     * Determine new status and message based on existing record
     */
    protected function determineStatusAndMessage($existingRecord, string $annexName): array
    {
        $newStatus = 'submitted';
        $message = "{$annexName} submitted successfully! Waiting for publish date.";

        if (!$existingRecord) {
            return [$newStatus, $message];
        }

        if ($existingRecord->status === 'submitted') {
            $newStatus = 'submitted';
            $message = 'Previous submission replaced. New submission waiting for publish date.';
        } elseif ($existingRecord->status === 'published') {
            $newStatus = 'request';
            $message = 'Update request submitted successfully! Waiting for admin approval.';
        } elseif ($existingRecord->status === 'request') {
            $newStatus = 'request';
            $message = 'Previous request replaced. New request waiting for admin approval.';
        }

        return [$newStatus, $message];
    }

    /**
     * Overwrite existing records based on status
     */
    protected function overwriteExisting($model, int $heiId, string $academicYear, string $status): void
    {
        $model::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->where('status', $status)
            ->update(['status' => 'overwritten']);
    }

    /**
     * Check ownership of a record
     */
    protected function checkOwnership($record, int $heiId): bool
    {
        return $record && $record->hei_id === $heiId;
    }
}
