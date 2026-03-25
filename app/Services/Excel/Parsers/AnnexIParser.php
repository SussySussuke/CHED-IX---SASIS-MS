<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex I — Scholarships/Financial Assistance
 * Cols: scholarship_name | type | category_intended_beneficiaries
 *       number_of_beneficiaries | remarks
 *
 * Row 8 is a cosmetic sub-row (header examples) — data starts at row 9.
 */
class AnnexIParser extends BaseParser
{
    private const DATA_ROW_START = 9;

    public function sheetId(): string { return 'ANNEX_I'; }
    public function label(): string   { return 'Annex I - Scholarships/Financial Assistance'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 5)) continue;

            $anyData = true;
            $name       = $this->str($ws, $r, 1);
            $type       = $this->str($ws, $r, 2);
            $category   = $this->str($ws, $r, 3);
            $count      = $this->int_($ws, $r, 4);
            $remarks    = $this->str($ws, $r, 5);

            if (!$name)     $errors[] = ['row' => $r, 'field' => 'scholarship_name',             'message' => 'Scholarship name is required.'];
            if (!$type)     $errors[] = ['row' => $r, 'field' => 'type',                         'message' => 'Type is required.'];
            if (!$category) $errors[] = ['row' => $r, 'field' => 'category_intended_beneficiaries', 'message' => 'Category/Beneficiaries is required.'];

            $rows[] = [
                'scholarship_name'                => $name ?? '',
                'type'                            => $type ?? '',
                'category_intended_beneficiaries' => $category ?? '',
                'number_of_beneficiaries'         => $count,
                'remarks'                         => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['scholarships' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
