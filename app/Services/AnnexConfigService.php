<?php

namespace App\Services;

/**
 * Centralized configuration service for Annex types
 * Provides consistent configuration across the application
 */
class AnnexConfigService
{
    /**
     * Get all annex types configuration
     */
    public static function getAnnexTypes(): array
    {
        return [
            'A' => [
                'model' => \App\Models\AnnexABatch::class,
                'relation' => 'programs',
                'name' => 'List of Programs Offered'
            ],
            'B' => [
                'model' => \App\Models\AnnexBBatch::class,
                'relation' => 'programs',
                'name' => 'Curricular Programs'
            ],
            'C' => [
                'model' => \App\Models\AnnexCBatch::class,
                'relation' => 'programs',
                'name' => 'Enrolment'
            ],
            'D' => [
                'model' => \App\Models\AnnexDSubmission::class,
                'relation' => null,
                'name' => 'Graduates'
            ],
            'E' => [
                'model' => \App\Models\AnnexEBatch::class,
                'relation' => 'organizations',
                'name' => 'Student Services'
            ],
            'F' => [
                'model' => \App\Models\AnnexFBatch::class,
                'relation' => 'activities',
                'name' => 'Institutional Linkages'
            ],
            'G' => [
                'model' => \App\Models\AnnexGSubmission::class,
                'relation' => null,
                'name' => 'Research'
            ],
            'H' => [
                'model' => \App\Models\AnnexHBatch::class,
                'relation' => 'admissionStatistics',
                'name' => 'Admission Statistics'
            ],
            'I' => [
                'model' => \App\Models\AnnexIBatch::class,
                'relation' => 'scholarships',
                'name' => 'Scholarship Grants'
            ],
            'J' => [
                'model' => \App\Models\AnnexJBatch::class,
                'relation' => 'programs',
                'name' => 'Faculty Development'
            ],
            'K' => [
                'model' => \App\Models\AnnexKBatch::class,
                'relation' => 'committees',
                'name' => 'Governance'
            ],
            'L' => [
                'model' => \App\Models\AnnexLBatch::class,
                'relation' => 'housing',
                'name' => 'Physical Facilities'
            ],
            'M' => [
                'model' => \App\Models\AnnexMBatch::class,
                'relation' => 'statistics',
                'name' => 'Library Services'
            ],
            'N' => [
                'model' => \App\Models\AnnexNBatch::class,
                'relation' => 'activities',
                'name' => 'Extension Services'
            ],
            'O' => [
                'model' => \App\Models\AnnexOBatch::class,
                'relation' => 'programs',
                'name' => 'Institutional Sustainability'
            ],
        ];
    }

    /**
     * Get configuration for a specific annex
     */
    public static function getAnnexConfig(string $annexType): ?array
    {
        $types = self::getAnnexTypes();
        return $types[$annexType] ?? null;
    }

    /**
     * Check if annex type is valid
     */
    public static function isValidAnnexType(string $annexType): bool
    {
        return isset(self::getAnnexTypes()[$annexType]);
    }

    /**
     * Get annex model class
     */
    public static function getAnnexModel(string $annexType): ?string
    {
        $config = self::getAnnexConfig($annexType);
        return $config['model'] ?? null;
    }

    /**
     * Get annex relation name
     */
    public static function getAnnexRelation(string $annexType): ?string
    {
        $config = self::getAnnexConfig($annexType);
        return $config['relation'] ?? null;
    }

    /**
     * Get annex display name
     */
    public static function getAnnexName(string $annexType): ?string
    {
        $config = self::getAnnexConfig($annexType);
        return $config['name'] ?? null;
    }
}
