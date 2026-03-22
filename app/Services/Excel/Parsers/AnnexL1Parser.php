<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex L-1 — Foreign/International Student Services
 * Cols: service_name | service_type | target_nationality
 *       number_of_students_served | officer_in_charge | remarks
 */
class AnnexL1Parser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_L1'; }
    public function label(): string   { return 'Annex L-1 - Foreign/International Student Services'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 6)) continue;

            $anyData     = true;
            $name        = $this->str($ws, $r, 1);
            $type        = $this->str($ws, $r, 2);
            $nationality = $this->str($ws, $r, 3);
            $count       = $this->int_($ws, $r, 4);
            $officer     = $this->str($ws, $r, 5);
            $remarks     = $this->str($ws, $r, 6);

            if (!$name)        $errors[] = ['row' => $r, 'field' => 'service_name',       'message' => 'Service name is required.'];
            if (!$type)        $errors[] = ['row' => $r, 'field' => 'service_type',       'message' => 'Service type is required.'];
            if (!$nationality) $errors[] = ['row' => $r, 'field' => 'target_nationality', 'message' => 'Target nationality is required.'];
            if (!$officer)     $errors[] = ['row' => $r, 'field' => 'officer_in_charge',  'message' => 'Officer-in-charge is required.'];

            $rows[] = [
                'service_name'             => $name ?? '',
                'service_type'             => $type ?? '',
                'target_nationality'       => $nationality ?? '',
                'number_of_students_served' => $count,
                'officer_in_charge'        => $officer ?? '',
                'remarks'                  => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['internationalServices' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
