<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex K — Safety and Security Committees
 * Cols: committee_name | committee_head_name | members_composition
 *       programs_projects_activities_trainings | remarks
 */
class AnnexKParser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_K'; }
    public function label(): string   { return 'Annex K - Safety and Security Committees'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 5)) continue;

            $anyData     = true;
            $name        = $this->str($ws, $r, 1);
            $head        = $this->str($ws, $r, 2);
            $members     = $this->str($ws, $r, 3);
            $activities  = $this->str($ws, $r, 4);
            $remarks     = $this->str($ws, $r, 5);

            if (!$name)    $errors[] = ['row' => $r, 'field' => 'committee_name',      'message' => 'Committee name is required.'];
            if (!$head)    $errors[] = ['row' => $r, 'field' => 'committee_head_name', 'message' => 'Committee head is required.'];
            if (!$members) $errors[] = ['row' => $r, 'field' => 'members_composition', 'message' => 'Members/composition is required.'];

            $rows[] = [
                'committee_name'                        => $name ?? '',
                'committee_head_name'                   => $head ?? '',
                'members_composition'                   => $members ?? '',
                'programs_projects_activities_trainings' => $activities,
                'remarks'                               => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['committees' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
