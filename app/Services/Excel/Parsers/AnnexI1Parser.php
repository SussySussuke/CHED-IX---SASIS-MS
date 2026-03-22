<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex I-1 — Food Services
 * Cols: service_name | service_type | operator_name | location
 *       number_of_students_served | remarks
 */
class AnnexI1Parser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_I1'; }
    public function label(): string   { return 'Annex I-1 - Food Services'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 6)) continue;

            $anyData      = true;
            $name         = $this->str($ws, $r, 1);
            $type         = $this->str($ws, $r, 2);
            $operator     = $this->str($ws, $r, 3);
            $location     = $this->str($ws, $r, 4);
            $studentsServed = $this->int_($ws, $r, 5);
            $remarks      = $this->str($ws, $r, 6);

            if (!$name)     $errors[] = ['row' => $r, 'field' => 'service_name',  'message' => 'Service/Facility name is required.'];
            if (!$type)     $errors[] = ['row' => $r, 'field' => 'service_type',  'message' => 'Type of service is required.'];
            if (!$operator) $errors[] = ['row' => $r, 'field' => 'operator_name', 'message' => 'Operator is required.'];
            if (!$location) $errors[] = ['row' => $r, 'field' => 'location',      'message' => 'Location is required.'];

            $rows[] = [
                'service_name'             => $name ?? '',
                'service_type'             => $type ?? '',
                'operator_name'            => $operator ?? '',
                'location'                 => $location ?? '',
                'number_of_students_served' => $studentsServed,
                'remarks'                  => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['foodServices' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
