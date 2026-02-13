<?php

namespace App\Services;

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH - ALL FORMS CONFIGURATION
 * ============================================================================
 * 
 * This service is the BACKEND equivalent of frontend's formConfig.js
 * It provides consistent configuration for ALL forms across the application:
 * - Summary
 * - MER Forms (MER1, MER2, MER3, MER4A)
 * - Annexes (A through O, including C-1, I-1, L-1, N-1)
 * 
 * DO NOT create separate config files. This is the ONE TRUE SOURCE.
 * ============================================================================
 */
class FormConfigService
{
    /**
     * Get ALL form types configuration (Summary + MER + Annexes)
     * Returns: ['SUMMARY' => [...], 'MER1' => [...], 'A' => [...], ...]
     */
    public static function getAllFormTypes(): array
    {
        return array_merge(
            self::getSummaryConfig(),
            self::getMERFormTypes(),
            self::getAnnexTypes()
        );
    }

    /**
     * Get Summary form configuration
     */
    public static function getSummaryConfig(): array
    {
        return [
            'SUMMARY' => [
                'model' => \App\Models\Summary::class,
                'relation' => null,
                'name' => 'Summary - School Details'
            ]
        ];
    }

    /**
     * Get MER form types configuration
     */
    public static function getMERFormTypes(): array
    {
        return [
            'MER1' => [
                'model' => \App\Models\MER1Submission::class,
                'relation' => 'educationalAttainments', // Also has 'trainings'
                'name' => 'HEI Profile on SAS'
            ],
            'MER2' => [
                'model' => \App\Models\MER2Submission::class,
                'relation' => 'personnel',
                'name' => 'HEI Directory of SAS'
            ],
            'MER3' => [
                'model' => \App\Models\MER3Submission::class,
                'relation' => 'schoolFees',
                'name' => 'Matrix of School Fees for SAS'
            ],
            'MER4A' => [
                'model' => \App\Models\MER4ASubmission::class,
                'relation' => 'sasManagementItems', // Also has 'guidanceCounselingItems'
                'name' => 'SAS Programs and Services Strategic Approaches/Actions'
            ],
        ];
    }

    /**
     * Get Annex types configuration (A through O)
     */
    public static function getAnnexTypes(): array
    {
        return [
            'A' => [
                'model' => \App\Models\AnnexABatch::class,
                'relation' => 'programs',
                'name' => 'Information and Orientation Services'
            ],
            'B' => [
                'model' => \App\Models\AnnexBBatch::class,
                'relation' => 'programs',
                'name' => 'Guidance and Counseling Service'
            ],
            'C' => [
                'model' => \App\Models\AnnexCBatch::class,
                'relation' => 'programs',
                'name' => 'Career and Job Placement Services'
            ],
            'C-1' => [
                'model' => \App\Models\AnnexC1Batch::class,
                'relation' => 'programs',
                'name' => 'Economic Enterprise Development'
            ],
            'D' => [
                'model' => \App\Models\AnnexDSubmission::class,
                'relation' => null,
                'name' => 'Student Handbook'
            ],
            'E' => [
                'model' => \App\Models\AnnexEBatch::class,
                'relation' => 'organizations',
                'name' => 'Student Organizations'
            ],
            'F' => [
                'model' => \App\Models\AnnexFBatch::class,
                'relation' => 'activities',
                'name' => 'Student Discipline'
            ],
            'G' => [
                'model' => \App\Models\AnnexGSubmission::class,
                'relation' => null,
                'name' => 'Student Publication'
            ],
            'H' => [
                'model' => \App\Models\AnnexHBatch::class,
                'relation' => 'admissionStatistics',
                'name' => 'Admission Services'
            ],
            'I' => [
                'model' => \App\Models\AnnexIBatch::class,
                'relation' => 'scholarships',
                'name' => 'Scholarships/Financial Assistance'
            ],
            'I-1' => [
                'model' => \App\Models\AnnexI1Batch::class,
                'relation' => 'foodServices',
                'name' => 'Food Services'
            ],
            'J' => [
                'model' => \App\Models\AnnexJBatch::class,
                'relation' => 'programs',
                'name' => 'Health Services'
            ],
            'K' => [
                'model' => \App\Models\AnnexKBatch::class,
                'relation' => 'committees',
                'name' => 'Safety and Security Committees'
            ],
            'L' => [
                'model' => \App\Models\AnnexLBatch::class,
                'relation' => 'housing',
                'name' => 'Student Housing'
            ],
            'L-1' => [
                'model' => \App\Models\AnnexL1Batch::class,
                'relation' => 'internationalServices',
                'name' => 'Foreign/International Students Services'
            ],
            'M' => [
                'model' => \App\Models\AnnexMBatch::class,
                'relation' => 'statistics',
                'name' => 'Sports Development'
            ],
            'N' => [
                'model' => \App\Models\AnnexNBatch::class,
                'relation' => 'activities',
                'name' => 'Culture and the Arts'
            ],
            'N-1' => [
                'model' => \App\Models\AnnexN1Batch::class,
                'relation' => 'sportsPrograms',
                'name' => 'Sports Development Program'
            ],
            'O' => [
                'model' => \App\Models\AnnexOBatch::class,
                'relation' => 'programs',
                'name' => 'Community Involvement/Outreach'
            ],
        ];
    }

    /**
     * Get priority order for ALL forms (matches frontend PRIORITY_ORDER)
     * This defines the canonical ordering for forms throughout the system
     */
    public static function getPriorityOrder(): array
    {
        return [
            'SUMMARY',
            'MER1',
            'MER2',
            'MER3',
            'MER4A',
            'A',
            'B',
            'C',
            'C-1',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'I-1',
            'J',
            'K',
            'L',
            'L-1',
            'M',
            'N',
            'N-1',
            'O'
        ];
    }

    /**
     * Get configuration for a specific form
     */
    public static function getFormConfig(string $formCode): ?array
    {
        $allForms = self::getAllFormTypes();
        return $allForms[$formCode] ?? null;
    }

    /**
     * Check if form code is valid
     */
    public static function isValidFormType(string $formCode): bool
    {
        return isset(self::getAllFormTypes()[$formCode]);
    }

    /**
     * Get form model class
     */
    public static function getFormModel(string $formCode): ?string
    {
        $config = self::getFormConfig($formCode);
        return $config['model'] ?? null;
    }

    /**
     * Get form relation name
     */
    public static function getFormRelation(string $formCode): ?string
    {
        $config = self::getFormConfig($formCode);
        return $config['relation'] ?? null;
    }

    /**
     * Get form display name
     */
    public static function getFormName(string $formCode): ?string
    {
        $config = self::getFormConfig($formCode);
        return $config['name'] ?? null;
    }

    /**
     * Get total count of all forms (used for completion percentage calculations)
     */
    public static function getTotalFormsCount(): int
    {
        return count(self::getAllFormTypes());
    }

    // ============================================================================
    // LEGACY METHODS - For backwards compatibility with AnnexConfigService
    // These will be deprecated once all code is migrated to use FormConfigService
    // ============================================================================

    /**
     * @deprecated Use getFormConfig() instead
     */
    public static function getAnnexConfig(string $annexType): ?array
    {
        return self::getFormConfig($annexType);
    }

    /**
     * @deprecated Use isValidFormType() instead
     */
    public static function isValidAnnexType(string $annexType): bool
    {
        return self::isValidFormType($annexType);
    }

    /**
     * @deprecated Use getFormModel() instead
     */
    public static function getAnnexModel(string $annexType): ?string
    {
        return self::getFormModel($annexType);
    }

    /**
     * @deprecated Use getFormRelation() instead
     */
    public static function getAnnexRelation(string $annexType): ?string
    {
        return self::getFormRelation($annexType);
    }

    /**
     * @deprecated Use getFormName() instead. Display names now managed in frontend formConfig.js
     */
    public static function getAnnexName(string $annexType): ?string
    {
        return self::getFormName($annexType);
    }
}
