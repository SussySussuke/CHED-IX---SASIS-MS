<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex N — Culture and the Arts
 * Cols: title_of_activity | implementation_date | implementation_venue
 *       participants_online | participants_face_to_face | organizer | remarks
 */
class AnnexNParser extends BaseParser
{
    private const DATA_ROW_START = 8;

    public function sheetId(): string { return 'ANNEX_N'; }
    public function label(): string   { return 'Annex N - Culture and the Arts'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 7)) continue;

            $anyData = true;
            $title   = $this->str($ws, $r, 1);
            $date    = $this->date_($ws, $r, 2);
            $venue   = $this->str($ws, $r, 3);
            $online  = $this->int_($ws, $r, 4);
            $f2f     = $this->int_($ws, $r, 5);
            $org     = $this->str($ws, $r, 6);
            $remarks = $this->str($ws, $r, 7);

            if (!$title) $errors[] = ['row' => $r, 'field' => 'title_of_activity',      'message' => 'Activity title is required.'];
            if (!$date)  $errors[] = ['row' => $r, 'field' => 'implementation_date',    'message' => 'Invalid or missing date.'];
            if (!$venue) $errors[] = ['row' => $r, 'field' => 'implementation_venue',   'message' => 'Venue is required.'];
            if (!$org)   $errors[] = ['row' => $r, 'field' => 'organizer',              'message' => 'Organizer is required.'];

            $rows[] = [
                'title_of_activity'        => $title ?? '',
                'implementation_date'      => $date ?? '',
                'implementation_venue'     => $venue ?? '',
                'participants_online'      => $online,
                'participants_face_to_face' => $f2f,
                'organizer'                => $org ?? '',
                'remarks'                  => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['activities' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
