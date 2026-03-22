<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex N-1 — Sports Development Program
 * Cols: program_title | sport_type | implementation_date | venue
 *       participants_count | organizer | remarks
 */
class AnnexN1Parser extends BaseParser
{
    private const DATA_ROW_START = 8;

    public function sheetId(): string { return 'ANNEX_N1'; }
    public function label(): string   { return 'Annex N-1 - Sports Development Program'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $rows    = [];
        $errors  = [];
        $anyData = false;
        $maxRow  = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 7)) continue;

            $anyData   = true;
            $title     = $this->str($ws, $r, 1);
            $sportType = $this->str($ws, $r, 2);
            $date      = $this->date_($ws, $r, 3);
            $venue     = $this->str($ws, $r, 4);
            $count     = $this->int_($ws, $r, 5);
            $org       = $this->str($ws, $r, 6);
            $remarks   = $this->str($ws, $r, 7);

            if (!$title)     $errors[] = ['row' => $r, 'field' => 'program_title',       'message' => 'Program title is required.'];
            if (!$sportType) $errors[] = ['row' => $r, 'field' => 'sport_type',          'message' => 'Sport type is required.'];
            if (!$date)      $errors[] = ['row' => $r, 'field' => 'implementation_date', 'message' => 'Invalid or missing date.'];
            if (!$venue)     $errors[] = ['row' => $r, 'field' => 'venue',               'message' => 'Venue is required.'];
            if (!$org)       $errors[] = ['row' => $r, 'field' => 'organizer',           'message' => 'Organizer is required.'];

            $rows[] = [
                'program_title'       => $title ?? '',
                'sport_type'          => $sportType ?? '',
                'implementation_date' => $date ?? '',
                'venue'               => $venue ?? '',
                'participants_count'  => $count,
                'organizer'           => $org ?? '',
                'remarks'             => $remarks,
            ];
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['sportsPrograms' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
