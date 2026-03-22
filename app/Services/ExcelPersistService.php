<?php

namespace App\Services;

use App\Http\Controllers\HEI\BaseAnnexController;
use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexCBatch;
use App\Models\AnnexDSubmission;
use App\Models\AnnexEBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexGSubmission;
use App\Models\AnnexHBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexIBatch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexLBatch;
use App\Models\AnnexMBatch;
use App\Models\AnnexN1Batch;
use App\Models\AnnexNBatch;
use App\Models\AnnexOBatch;

/**
 * Persists a parsed Excel sheet's payload into the database.
 * Reuses the same overwrite/status logic as BaseAnnexController
 * without going through the HTTP layer.
 *
 * Per README: business logic belongs in Services, not controllers.
 */
class ExcelPersistService
{
    /**
     * Persist a single parsed sheet payload.
     * Must be called inside a DB transaction (ExcelController handles the wrapping).
     */
    public function persist(string $sheetId, array $payload, int $heiId, string $academicYear): void
    {
        match ($sheetId) {
            'ANNEX_A'  => $this->persistTabularBatch(AnnexABatch::class,  'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_B'  => $this->persistTabularBatch(AnnexBBatch::class,  'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_C'  => $this->persistTabularBatch(AnnexCBatch::class,  'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_C1' => $this->persistTabularBatch(AnnexC1Batch::class, 'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_E'  => $this->persistTabularBatch(AnnexEBatch::class,  'organizations',        $heiId, $academicYear, $payload['organizations']),
            'ANNEX_I'  => $this->persistTabularBatch(AnnexIBatch::class,  'scholarships',         $heiId, $academicYear, $payload['scholarships']),
            'ANNEX_I1' => $this->persistTabularBatch(AnnexI1Batch::class, 'foodServices',         $heiId, $academicYear, $payload['foodServices']),
            'ANNEX_J'  => $this->persistTabularBatch(AnnexJBatch::class,  'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_K'  => $this->persistTabularBatch(AnnexKBatch::class,  'committees',           $heiId, $academicYear, $payload['committees']),
            'ANNEX_L'  => $this->persistTabularBatch(AnnexLBatch::class,  'housing',              $heiId, $academicYear, $payload['housing']),
            'ANNEX_L1' => $this->persistTabularBatch(AnnexL1Batch::class, 'internationalServices', $heiId, $academicYear, $payload['internationalServices']),
            'ANNEX_N'  => $this->persistTabularBatch(AnnexNBatch::class,  'activities',           $heiId, $academicYear, $payload['activities']),
            'ANNEX_N1' => $this->persistTabularBatch(AnnexN1Batch::class, 'sportsPrograms',       $heiId, $academicYear, $payload['sportsPrograms']),
            'ANNEX_O'  => $this->persistTabularBatch(AnnexOBatch::class,  'programs',             $heiId, $academicYear, $payload['programs']),
            'ANNEX_D'  => $this->persistAnnexD($heiId, $academicYear, $payload),
            'ANNEX_F'  => $this->persistAnnexF($heiId, $academicYear, $payload),
            'ANNEX_G'  => $this->persistAnnexG($heiId, $academicYear, $payload),
            'ANNEX_H'  => $this->persistAnnexH($heiId, $academicYear, $payload),
            'ANNEX_M'  => $this->persistAnnexM($heiId, $academicYear, $payload),
            default    => null,
        };
    }

    // ── tabular batch (generic) ────────────────────────────────────────────

    private function persistTabularBatch(
        string $batchClass,
        string $relation,
        int    $heiId,
        string $academicYear,
        array  $rows
    ): void {
        [$newStatus] = $this->resolveStatus($batchClass, $heiId, $academicYear);

        $batch = $batchClass::create([
            'hei_id'       => $heiId,
            'academic_year' => $academicYear,
            'status'       => $newStatus,
        ]);

        foreach ($rows as $row) {
            $batch->$relation()->create($row);
        }

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── Annex D ────────────────────────────────────────────────────────────

    private function persistAnnexD(int $heiId, string $academicYear, array $payload): void
    {
        [$newStatus] = $this->resolveStatus(AnnexDSubmission::class, $heiId, $academicYear);

        AnnexDSubmission::create(array_merge($payload, [
            'hei_id'        => $heiId,
            'academic_year' => $academicYear,
            'status'        => $newStatus,
        ]));

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── Annex F ────────────────────────────────────────────────────────────

    private function persistAnnexF(int $heiId, string $academicYear, array $payload): void
    {
        [$newStatus] = $this->resolveStatus(AnnexFBatch::class, $heiId, $academicYear);

        $batch = AnnexFBatch::create([
            'hei_id'                       => $heiId,
            'academic_year'                => $academicYear,
            'status'                       => $newStatus,
            'student_discipline_committee' => $payload['student_discipline_committee'] ?? null,
            'procedure_mechanism'          => $payload['procedure_mechanism'] ?? null,
            'complaint_desk'               => $payload['complaint_desk'] ?? null,
        ]);

        foreach ($payload['activities'] ?? [] as $act) {
            $batch->activities()->create($act);
        }

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── Annex G ────────────────────────────────────────────────────────────

    private function persistAnnexG(int $heiId, string $academicYear, array $payload): void
    {
        [$newStatus] = $this->resolveStatus(AnnexGSubmission::class, $heiId, $academicYear);

        $editorialBoards   = $payload['editorial_boards']   ?? [];
        $otherPublications = $payload['other_publications'] ?? [];
        $programs          = $payload['programs']           ?? [];

        $fields = array_diff_key($payload, array_flip(['editorial_boards', 'other_publications', 'programs']));

        $submission = AnnexGSubmission::create(array_merge($fields, [
            'hei_id'        => $heiId,
            'academic_year' => $academicYear,
            'status'        => $newStatus,
        ]));

        foreach ($editorialBoards   as $eb)   { $submission->editorialBoards()->create($eb); }
        foreach ($otherPublications as $op)   { $submission->otherPublications()->create($op); }
        foreach ($programs          as $prog) { $submission->programs()->create($prog); }

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── Annex H ────────────────────────────────────────────────────────────

    private function persistAnnexH(int $heiId, string $academicYear, array $payload): void
    {
        [$newStatus] = $this->resolveStatus(AnnexHBatch::class, $heiId, $academicYear);

        $batch = AnnexHBatch::create([
            'hei_id'        => $heiId,
            'academic_year' => $academicYear,
            'status'        => $newStatus,
        ]);

        foreach ($payload['admission_services']   ?? [] as $svc)  { $batch->admissionServices()->create($svc); }
        foreach ($payload['admission_statistics'] ?? [] as $stat) { $batch->admissionStatistics()->create($stat); }

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── Annex M ────────────────────────────────────────────────────────────

    private function persistAnnexM(int $heiId, string $academicYear, array $payload): void
    {
        [$newStatus] = $this->resolveStatus(AnnexMBatch::class, $heiId, $academicYear);

        $batch = AnnexMBatch::create([
            'hei_id'        => $heiId,
            'academic_year' => $academicYear,
            'status'        => $newStatus,
        ]);

        foreach ($payload['statistics'] ?? [] as $stat) { $batch->statistics()->create($stat); }
        foreach ($payload['services']   ?? [] as $svc)  { $batch->services()->create($svc); }

        CacheService::clearHeiCaches($heiId, $academicYear);
    }

    // ── shared status resolution ───────────────────────────────────────────

    /**
     * Mirrors BaseAnnexController::determineStatusAndMessage + overwriteExisting.
     * Returns [$newStatus].
     */
    private function resolveStatus(string $modelClass, int $heiId, string $academicYear): array
    {
        $existing = $modelClass::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        if (!$existing) {
            return ['submitted'];
        }

        // Overwrite the existing record
        if (in_array($existing->status, ['published', 'request'], true)) {
            $modelClass::where('hei_id', $heiId)
                ->where('academic_year', $academicYear)
                ->where('status', 'request')
                ->update(['status' => 'overwritten']);
            $newStatus = 'request';
        } else {
            $modelClass::where('hei_id', $heiId)
                ->where('academic_year', $academicYear)
                ->where('status', 'submitted')
                ->update(['status' => 'overwritten']);
            $newStatus = 'submitted';
        }

        return [$newStatus];
    }
}
