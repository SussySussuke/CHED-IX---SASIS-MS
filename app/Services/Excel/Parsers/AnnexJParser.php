<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex J — Health Services
 * Cols: title_of_program | organizer | participants_online
 *       participants_face_to_face | remarks
 */
class AnnexJParser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_J'; }
    public function label(): string   { return 'Annex J - Health Services'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 5)) continue;

            $anyData = true;
            $title   = $this->str($ws, $r, 1);
            $org     = $this->str($ws, $r, 2);
            $online  = $this->int_($ws, $r, 3);
            $f2f     = $this->int_($ws, $r, 4);
            $remarks = $this->str($ws, $r, 5);

            if (!$title) $errors[] = ['row' => $r, 'field' => 'title_of_program', 'message' => 'Program title is required.'];
            if (!$org)   $errors[] = ['row' => $r, 'field' => 'organizer',        'message' => 'Organizer is required.'];

            $rows[] = [
                'title_of_program'         => $title ?? '',
                'organizer'                => $org ?? '',
                'participants_online'      => $online,
                'participants_face_to_face' => $f2f,
                'remarks'                  => $remarks,
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
