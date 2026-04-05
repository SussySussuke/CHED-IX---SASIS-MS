<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Http\Requests\HEI\ImportExcelRequest;
use App\Services\ExcelExportService;
use App\Services\ExcelImportService;
use App\Services\ExcelPersistService;
use App\Services\Excel\Parsers\ParseResult;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;

class ExcelController extends Controller
{
    public function __construct(
        private readonly ExcelImportService  $importService,
        private readonly ExcelExportService  $exportService,
        private readonly ExcelPersistService $persistService,
    ) {}

    // ── Page ───────────────────────────────────────────────────────────────

    public function page(): \Inertia\Response
    {
        $currentYear    = (int) date('Y');
        $availableYears = [];
        for ($y = 1994; $y <= $currentYear; $y++) {
            $availableYears[] = $y . '-' . ($y + 1);
        }

        return Inertia::render('HEI/ExcelImport', [
            'availableYears' => $availableYears,
            'defaultYear'    => ($currentYear - 1) . '-' . $currentYear,
        ]);
    }

    // ── Export ─────────────────────────────────────────────────────────────

    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'academic_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ]);

        return $this->exportService->downloadTemplate(
            Auth::user()->hei_id,
            $request->query('academic_year')
        );
    }

    public function exportEmpty(Request $request): StreamedResponse
    {
        $request->validate([
            'academic_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ]);

        return $this->exportService->downloadEmptyTemplate(
            $request->query('academic_year')
        );
    }

    // ── Import — Step 1: Parse & detect conflicts ──────────────────────────

    public function import(ImportExcelRequest $request): JsonResponse
    {
        $heiId        = Auth::user()->hei_id;
        $academicYear = $request->input('academic_year');

        try {
            $result = $this->importService->parse($request->file('file'), $academicYear, $heiId);
        } catch (\Throwable $e) {
            Log::error('Excel import parse failed', ['error' => $e->getMessage(), 'hei_id' => $heiId]);
            return response()->json(
                ['message' => 'Failed to read the Excel file. Make sure it is a valid SAS template.'],
                422
            );
        }

        // Store parsed payloads in session — avoids re-upload on the confirm step
        session(['excel_import_pending' => [
            'academic_year'     => $academicYear,
            'clean_ids'         => array_map(fn(ParseResult $r) => $r->sheetId, $result['clean']),
            'clean_payloads'    => array_map(fn(ParseResult $r) => $r->payload,  $result['clean']),
            'conflict_payloads' => array_map(fn(array $c) => [
                'sheetId' => $c['incoming']->sheetId,
                'payload' => $c['incoming']->payload,
            ], $result['conflicts']),
        ]]);

        return response()->json([
            'clean'     => array_map(fn(ParseResult $r) => [
                'sheetId'  => $r->sheetId,
                'label'    => $r->label,
                'rowCount' => $this->countRows($r),
            ], $result['clean']),
            'conflicts' => array_map(fn(array $c) => [
                'sheetId'         => $c['incoming']->sheetId,
                'label'           => $c['incoming']->label,
                'rowCount'        => $this->countRows($c['incoming']),
                'existingSummary' => $c['existing_summary'],
                'existingData'    => $c['existing_data'],
                'incomingData'    => $c['incoming']->payload,
            ], $result['conflicts']),
            'errors'    => array_map(fn(ParseResult $r) => [
                'sheetId' => $r->sheetId,
                'label'   => $r->label,
                'errors'  => $r->errors,
            ], $result['errors']),
            'skipped'   => array_map(fn(ParseResult $r) => [
                'sheetId' => $r->sheetId,
                'label'   => $r->label,
            ], $result['skipped']),
        ]);
    }

    // ── Import — Step 2: Confirm & persist ────────────────────────────────

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'approved_sheet_ids'   => ['nullable', 'array'],
            'approved_sheet_ids.*' => ['string'],
        ]);

        $pending = session('excel_import_pending');
        if (!$pending) {
            return response()->json(
                ['message' => 'Import session expired. Please upload the file again.'],
                422
            );
        }

        $heiId        = Auth::user()->hei_id;
        $academicYear = $pending['academic_year'];
        $approvedIds  = $request->input('approved_sheet_ids', []);

        // Collect payloads to save: clean sheets + user-approved conflict overwrites
        $toSave = [];
        foreach ($pending['clean_ids'] as $i => $sheetId) {
            $toSave[$sheetId] = $pending['clean_payloads'][$i];
        }
        foreach ($pending['conflict_payloads'] as $conflict) {
            if (in_array($conflict['sheetId'], $approvedIds, true)) {
                $toSave[$conflict['sheetId']] = $conflict['payload'];
            }
        }

        $saved = [];

        DB::beginTransaction();
        try {
            foreach ($toSave as $sheetId => $payload) {
                $this->persistService->persist($sheetId, $payload, $heiId, $academicYear);
                $saved[] = $sheetId;
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Excel import confirm failed', [
                'error'   => $e->getMessage(),
                'hei_id'  => $heiId,
                'saved_so_far' => $saved,
            ]);
            return response()->json(
                ['message' => 'Import failed during save. No data was changed.'],
                500
            );
        }

        session()->forget('excel_import_pending');

        return response()->json([
            'message' => count($saved) . ' form(s) imported successfully.',
            'saved'   => $saved,
        ]);
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private function countRows(ParseResult $result): int
    {
        $payload = $result->payload;
        $primary = $payload['programs']
            ?? $payload['organizations']
            ?? $payload['activities']
            ?? $payload['scholarships']
            ?? $payload['foodServices']
            ?? $payload['committees']
            ?? $payload['housing']
            ?? $payload['internationalServices']
            ?? $payload['sportsPrograms']
            ?? $payload['statistics']
            ?? null;

        return $primary ? count($primary) : 1;
    }
}
