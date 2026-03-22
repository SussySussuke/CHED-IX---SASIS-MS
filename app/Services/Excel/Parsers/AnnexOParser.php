<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex O — Community Involvement / Outreach Programs
 * Cols: title_of_program | date_conducted | number_of_beneficiaries
 *       type_of_community_service | community_population_served
 */
class AnnexOParser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_O'; }
    public function label(): string   { return 'Annex O - Community Involvement/Outreach'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 5)) continue;

            $anyData    = true;
            $title      = $this->str($ws, $r, 1);
            $date       = $this->date_($ws, $r, 2);
            $count      = $this->int_($ws, $r, 3);
            $serviceType = $this->str($ws, $r, 4);
            $community  = $this->str($ws, $r, 5);

            if (!$title)       $errors[] = ['row' => $r, 'field' => 'title_of_program',             'message' => 'Program title is required.'];
            if (!$date)        $errors[] = ['row' => $r, 'field' => 'date_conducted',               'message' => 'Invalid or missing date.'];
            if (!$serviceType) $errors[] = ['row' => $r, 'field' => 'type_of_community_service',    'message' => 'Type of community service is required.'];
            if (!$community)   $errors[] = ['row' => $r, 'field' => 'community_population_served',  'message' => 'Community/population served is required.'];

            $rows[] = [
                'title_of_program'            => $title ?? '',
                'date_conducted'              => $date ?? '',
                'number_of_beneficiaries'     => $count,
                'type_of_community_service'   => $serviceType ?? '',
                'community_population_served' => $community ?? '',
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['programs' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
