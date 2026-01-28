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
                'relation' => 'programs'
            ],
            'B' => [
                'model' => \App\Models\AnnexBBatch::class,
                'relation' => 'programs'
            ],
            'C' => [
                'model' => \App\Models\AnnexCBatch::class,
                'relation' => 'programs'
            ],
            'C-1' => [
                'model' => \App\Models\AnnexC1Batch::class,
                'relation' => 'programs'
            ],
            'D' => [
                'model' => \App\Models\AnnexDSubmission::class,
                'relation' => null
            ],
            'E' => [
                'model' => \App\Models\AnnexEBatch::class,
                'relation' => 'organizations'
            ],
            'F' => [
                'model' => \App\Models\AnnexFBatch::class,
                'relation' => 'activities'
            ],
            'G' => [
                'model' => \App\Models\AnnexGSubmission::class,
                'relation' => null
            ],
            'H' => [
                'model' => \App\Models\AnnexHBatch::class,
                'relation' => 'admissionStatistics'
            ],
            'I' => [
                'model' => \App\Models\AnnexIBatch::class,
                'relation' => 'scholarships'
            ],
            'I-1' => [
                'model' => \App\Models\AnnexI1Batch::class,
                'relation' => 'foodServices'
            ],
            'J' => [
                'model' => \App\Models\AnnexJBatch::class,
                'relation' => 'programs'
            ],
            'K' => [
                'model' => \App\Models\AnnexKBatch::class,
                'relation' => 'committees'
            ],
            'L' => [
                'model' => \App\Models\AnnexLBatch::class,
                'relation' => 'housing'
            ],
            'L-1' => [
                'model' => \App\Models\AnnexL1Batch::class,
                'relation' => 'internationalServices'
            ],
            'M' => [
                'model' => \App\Models\AnnexMBatch::class,
                'relation' => 'statistics'
            ],
            'N' => [
                'model' => \App\Models\AnnexNBatch::class,
                'relation' => 'activities'
            ],
            'N-1' => [
                'model' => \App\Models\AnnexN1Batch::class,
                'relation' => 'sportsPrograms'
            ],
            'O' => [
                'model' => \App\Models\AnnexOBatch::class,
                'relation' => 'programs'
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
     * NOTE: Display names are now managed in frontend (formConfig.js)
     * This method is deprecated and should not be used
     * @deprecated Use frontend ANNEX_NAMES instead
     */
    public static function getAnnexName(string $annexType): ?string
    {
        // Names are now in frontend formConfig.js
        return null;
    }
}
