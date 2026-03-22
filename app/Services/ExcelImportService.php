<?php

namespace App\Services;

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
use App\Services\Excel\Parsers\AnnexDParser;
use App\Services\Excel\Parsers\AnnexEParser;
use App\Services\Excel\Parsers\AnnexFParser;
use App\Services\Excel\Parsers\AnnexGParser;
use App\Services\Excel\Parsers\AnnexHParser;
use App\Services\Excel\Parsers\AnnexI1Parser;
use App\Services\Excel\Parsers\AnnexIParser;
use App\Services\Excel\Parsers\AnnexJParser;
use App\Services\Excel\Parsers\AnnexKParser;
use App\Services\Excel\Parsers\AnnexL1Parser;
use App\Services\Excel\Parsers\AnnexLParser;
use App\Services\Excel\Parsers\AnnexMParser;
use App\Services\Excel\Parsers\AnnexN1Parser;
use App\Services\Excel\Parsers\AnnexNParser;
use App\Services\Excel\Parsers\AnnexOParser;
use App\Services\Excel\Parsers\BaseParser;
use App\Services\Excel\Parsers\ParseResult;
use App\Services\Excel\Parsers\TabularProgramParser;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ExcelImportService
{
    /** Map sheet ID tag → parser instance */
    private array $parsers;

    /** Map sheet ID tag → Eloquent model class for conflict detection */
    private const MODEL_MAP = [
        'ANNEX_A'  => AnnexABatch::class,
        'ANNEX_B'  => AnnexBBatch::class,
        'ANNEX_C'  => AnnexCBatch::class,
        'ANNEX_C1' => AnnexC1Batch::class,
        'ANNEX_D'  => AnnexDSubmission::class,
        'ANNEX_E'  => AnnexEBatch::class,
        'ANNEX_F'  => AnnexFBatch::class,
        'ANNEX_G'  => AnnexGSubmission::class,
        'ANNEX_H'  => AnnexHBatch::class,
        'ANNEX_I'  => AnnexIBatch::class,
        'ANNEX_I1' => AnnexI1Batch::class,
        'ANNEX_J'  => AnnexJBatch::class,
        'ANNEX_K'  => AnnexKBatch::class,
        'ANNEX_L'  => AnnexLBatch::class,
        'ANNEX_L1' => AnnexL1Batch::class,
        'ANNEX_M'  => AnnexMBatch::class,
        'ANNEX_N'  => AnnexNBatch::class,
        'ANNEX_N1' => AnnexN1Batch::class,
        'ANNEX_O'  => AnnexOBatch::class,
    ];

    public function __construct()
    {
        $this->parsers = $this->buildParsers();
    }

    /**
     * Parse the uploaded Excel file and detect conflicts.
     *
     * Returns:
     * [
     *   'clean'     => ParseResult[],  // no existing record — safe to insert
     *   'conflicts' => [               // existing record found — needs user decision
     *     ['incoming' => ParseResult, 'existing_summary' => string]
     *   ],
     *   'errors'    => ParseResult[],  // had row-level validation errors
     *   'skipped'   => ParseResult[],  // empty sheets
     * ]
     */
    public function parse(UploadedFile $file, string $academicYear, int $heiId): array
    {
        $spreadsheet = IOFactory::load($file->getPathname());

        $clean     = [];
        $conflicts = [];
        $errors    = [];
        $skipped   = [];

        foreach ($spreadsheet->getAllSheets() as $ws) {
            $tag = strtoupper(trim((string) $ws->getCell('A1')->getValue()));

            // Strip brackets if present: [ANNEX_A] → ANNEX_A
            $tag = trim($tag, '[]');

            if (!isset($this->parsers[$tag])) {
                continue; // Unknown sheet — silently skip
            }

            /** @var BaseParser $parser */
            $parser = $this->parsers[$tag];
            $result = $parser->parse($ws);

            if ($result->isEmpty) {
                $skipped[] = $result;
                continue;
            }

            if ($result->hasErrors()) {
                $errors[] = $result;
                continue;
            }

            // Conflict detection
            $conflict = $this->detectConflict($tag, $heiId, $academicYear);
            if ($conflict) {
                $conflicts[] = [
                    'incoming'         => $result,
                    'existing_summary' => $conflict,
                ];
            } else {
                $clean[] = $result;
            }
        }

        return compact('clean', 'conflicts', 'errors', 'skipped');
    }

    /**
     * Build the payload for a confirmed import (clean + user-approved overwrites).
     * Returns an array keyed by sheet ID of payloads ready for the controllers.
     *
     * @param  ParseResult[] $results
     */
    public function collectPayloads(array $results): array
    {
        $out = [];
        foreach ($results as $result) {
            $out[$result->sheetId] = $result->payload;
        }
        return $out;
    }

    // ── private helpers ────────────────────────────────────────────────────

    private function detectConflict(string $tag, int $heiId, string $academicYear): ?string
    {
        $modelClass = self::MODEL_MAP[$tag] ?? null;
        if (!$modelClass) return null;

        $existing = $modelClass::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        if (!$existing) return null;

        return "Status: {$existing->status}, submitted on " . $existing->created_at?->format('M d, Y');
    }

    private function buildParsers(): array
    {
        $parsers = [
            new TabularProgramParser('ANNEX_A',  'Annex A - Information and Orientation Services', hasTargetGroup: true),
            new TabularProgramParser('ANNEX_B',  'Annex B - Guidance and Counseling Services',     hasTargetGroup: true),
            new TabularProgramParser('ANNEX_C',  'Annex C - Career and Job Placement Services',    hasTargetGroup: false),
            new TabularProgramParser('ANNEX_C1', 'Annex C-1 - Economic Enterprise Development',    hasTargetGroup: true),
            new AnnexDParser(),
            new AnnexEParser(),
            new AnnexFParser(),
            new AnnexGParser(),
            new AnnexHParser(),
            new AnnexIParser(),
            new AnnexI1Parser(),
            new AnnexJParser(),
            new AnnexKParser(),
            new AnnexLParser(),
            new AnnexL1Parser(),
            new AnnexMParser(),
            new AnnexNParser(),
            new AnnexN1Parser(),
            new AnnexOParser(),
        ];

        $map = [];
        foreach ($parsers as $parser) {
            $map[$parser->sheetId()] = $parser;
        }
        return $map;
    }
}
