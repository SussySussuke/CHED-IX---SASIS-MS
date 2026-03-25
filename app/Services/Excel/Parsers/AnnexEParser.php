<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex E — Student Organizations
 * Cols: name_of_accredited | years_of_existence | accredited_since
 *       faculty_adviser | president_and_officers | specialization
 *       fee_collected | programs_projects_activities
 *
 * Row 8 is a cosmetic sub-row (header examples) — data starts at row 9.
 */
class AnnexEParser extends BaseParser
{
    private const DATA_ROW_START = 9;

    public function sheetId(): string { return 'ANNEX_E'; }
    public function label(): string   { return 'Annex E - Student Organizations'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 8)) continue;

            $anyData = true;

            $name     = $this->str($ws, $r, 1);
            $years    = $this->int_($ws, $r, 2);
            $since    = $this->str($ws, $r, 3);
            $adviser  = $this->str($ws, $r, 4);
            $officers = $this->str($ws, $r, 5);
            $spec     = $this->str($ws, $r, 6);
            $fee      = $this->str($ws, $r, 7);
            $programs = $this->str($ws, $r, 8);

            if (!$name) $errors[] = ['row' => $r, 'field' => 'name_of_accredited', 'message' => 'Organization name is required.'];
            if (!$since) $errors[] = ['row' => $r, 'field' => 'accredited_since', 'message' => 'Accredited since is required.'];
            if (!$officers) $errors[] = ['row' => $r, 'field' => 'president_and_officers', 'message' => 'President/Officers is required.'];
            if (!$spec) $errors[] = ['row' => $r, 'field' => 'specialization', 'message' => 'Specialization is required.'];
            if (!$programs) $errors[] = ['row' => $r, 'field' => 'programs_projects_activities', 'message' => 'Programs/Activities is required.'];

            $rows[] = [
                'name_of_accredited'           => $name ?? '',
                'years_of_existence'           => $years,
                'accredited_since'             => $since ?? '',
                'faculty_adviser'              => $adviser,
                'president_and_officers'       => $officers ?? '',
                'specialization'               => $spec ?? '',
                'fee_collected'                => $fee,
                'programs_projects_activities' => $programs ?? '',
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['organizations' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
