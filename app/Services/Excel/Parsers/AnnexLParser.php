<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex L — Student Housing
 * Cols: housing_name | complete_address | house_manager_name
 *       male (YES/NO) | female (YES/NO) | coed (YES/NO) | others | remarks
 *
 * Validation: at least one of male/female/coed must be YES, or others must be filled.
 */
class AnnexLParser extends BaseParser
{
    private const DATA_ROW_START = 8;

    public function sheetId(): string { return 'ANNEX_L'; }
    public function label(): string   { return 'Annex L - Student Housing'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 8)) continue;

            $anyData = true;
            $name    = $this->str($ws, $r, 1);
            $address = $this->str($ws, $r, 2);
            $manager = $this->str($ws, $r, 3);
            $male    = $this->bool_($ws, $r, 4);
            $female  = $this->bool_($ws, $r, 5);
            $coed    = $this->bool_($ws, $r, 6);
            $others  = $this->str($ws, $r, 7);
            $remarks = $this->str($ws, $r, 8);

            if (!$name)    $errors[] = ['row' => $r, 'field' => 'housing_name',       'message' => 'Housing name is required.'];
            if (!$address) $errors[] = ['row' => $r, 'field' => 'complete_address',   'message' => 'Complete address is required.'];
            if (!$manager) $errors[] = ['row' => $r, 'field' => 'house_manager_name', 'message' => 'House manager name is required.'];

            if (!$male && !$female && !$coed && !$others) {
                $errors[] = ['row' => $r, 'field' => 'type', 'message' => 'At least one type must be selected (Male/Female/Co-ed) or Others specified.'];
            }

            $rows[] = [
                'housing_name'       => $name ?? '',
                'complete_address'   => $address ?? '',
                'house_manager_name' => $manager ?? '',
                'male'               => $male,
                'female'             => $female,
                'coed'               => $coed,
                'others'             => $others,
                'remarks'            => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['housing' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
