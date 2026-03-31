<?php

namespace App\Services\Excel\Parsers;

use App\Models\AnnexHAdmissionService;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex H — Admission Services
 *
 * Table 1 (Admission Services) — 8 predefined rows, locked service names:
 *   Row 5: column headers (Service Type | Check YES/NO | Supporting Documents | Remarks)
 *   Row 6..13: Col 1: service_type (locked) | Col 2: with (YES/NO) | Col 3: supporting_docs | Col 4: remarks
 *
 * Table 2 (Admission Statistics) starts at row 16 (row 14 spacer, row 15 stats headers):
 *   Col 1: program | Col 2: applicants | Col 3: admitted | Col 4: enrolled
 */
class AnnexHParser extends BaseParser
{
    private const SERVICES_ROW_START = 6;
    private const STATS_ROW_START    = 16;

    public function sheetId(): string { return 'ANNEX_H'; }
    public function label(): string   { return 'Annex H - Admission Services'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $services   = [];
        $statistics = [];
        $errors     = [];
        $anyData    = false;

        // Table 1: exactly 8 predefined services
        $predefined = AnnexHAdmissionService::PREDEFINED_SERVICES;
        foreach ($predefined as $i => $serviceType) {
            $r    = self::SERVICES_ROW_START + $i;
            $with = $this->bool_($ws, $r, 2);
            $docs = $this->str($ws, $r, 3);
            $rmks = $this->str($ws, $r, 4);

            if ($with || $docs || $rmks) $anyData = true;

            $services[] = [
                'service_type'         => $serviceType,
                'with'                 => $with,
                'supporting_documents' => $docs,
                'remarks'              => $rmks,
            ];
        }

        // Table 2: statistics (variable rows)
        $maxRow = $ws->getHighestDataRow();
        for ($r = self::STATS_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 4)) continue;

            $anyData = true;
            $program    = $this->str($ws, $r, 1);
            $applicants = $this->int_($ws, $r, 2);
            $admitted   = $this->int_($ws, $r, 3);
            $enrolled   = $this->int_($ws, $r, 4);

            if (!$program) {
                $errors[] = ['row' => $r, 'field' => 'program', 'message' => 'Program/Department name is required.'];
            }

            $statistics[] = [
                'program'    => $program ?? '',
                'applicants' => $applicants,
                'admitted'   => $admitted,
                'enrolled'   => $enrolled,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: [
                'admission_services'   => $services,
                'admission_statistics' => $statistics,
            ],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
