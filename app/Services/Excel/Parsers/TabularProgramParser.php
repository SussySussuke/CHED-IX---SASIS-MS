<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Shared parser for Annex A, B, C, C-1 — all have identical column layouts:
 * Col 1: title | Col 2: venue | Col 3: implementation_date
 * Col 4: target_group (A/B/C-1 only) | Col 5: participants_online
 * Col 6: participants_face_to_face | Col 7: organizer | Col 8: remarks
 *
 * Annex C does NOT have target_group — columns shift left after col 3.
 * DATA_ROW_START = 8 (row 1: tag, rows 2-5: title block, row 6: spacer, row 7: headers)
 */
class TabularProgramParser extends BaseParser
{
    private const DATA_ROW_START = 8;

    public function __construct(
        private readonly string $id,
        private readonly string $labelText,
        private readonly bool $hasTargetGroup,
    ) {}

    public function sheetId(): string { return $this->id; }
    public function label(): string   { return $this->labelText; }

    public function parse(Worksheet $ws): ParseResult
    {
        $maxCol  = $this->hasTargetGroup ? 8 : 7;
        $rows    = [];
        $errors  = [];
        $anyData = false;

        $maxRow = $ws->getHighestDataRow();

        for ($r = self::DATA_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, $maxCol)) continue;

            $anyData = true;
            $col     = 1;

            $title = $this->str($ws, $r, $col++);
            $venue = $this->str($ws, $r, $col++);
            $date  = $this->date_($ws, $r, $col++);

            $targetGroup = null;
            if ($this->hasTargetGroup) {
                $targetGroup = $this->str($ws, $r, $col++);
            }

            $online  = $this->int_($ws, $r, $col++);
            $f2f     = $this->int_($ws, $r, $col++);
            $org     = $this->str($ws, $r, $col++);
            $remarks = $this->str($ws, $r, $col++);

            // Validate required fields
            if (!$title) {
                $errors[] = ['row' => $r, 'field' => 'title', 'message' => 'Title is required.'];
            }
            if (!$venue) {
                $errors[] = ['row' => $r, 'field' => 'venue', 'message' => 'Venue is required.'];
            }
            if (!$date) {
                $errors[] = ['row' => $r, 'field' => 'implementation_date', 'message' => 'Invalid or missing date. Use YYYY-MM-DD format.'];
            }
            if ($this->hasTargetGroup && !$targetGroup) {
                $errors[] = ['row' => $r, 'field' => 'target_group', 'message' => 'Target group is required.'];
            }
            if (!$org) {
                $errors[] = ['row' => $r, 'field' => 'organizer', 'message' => 'Organizer is required.'];
            }

            if ($title || $date || $org) { // partial row — still record it even if invalid
                $row = [
                    'title'                    => $title ?? '',
                    'venue'                    => $venue ?? '',
                    'implementation_date'      => $date ?? '',
                    'participants_online'      => $online,
                    'participants_face_to_face' => $f2f,
                    'organizer'                => $org ?? '',
                    'remarks'                  => $remarks,
                ];
                if ($this->hasTargetGroup) {
                    $row['target_group'] = $targetGroup ?? '';
                }
                $rows[] = $row;
            }
        }

        return new ParseResult(
            sheetId: $this->id,
            label:   $this->label(),
            payload: ['programs' => $rows],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
