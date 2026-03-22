<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex F — Student Discipline
 * Header fields: rows 5-7 (student_discipline_committee, procedure_mechanism, complaint_desk)
 * Activity table starts at row 9:
 *   Col 1: activity | Col 2: date | Col 3: status
 */
class AnnexFParser extends BaseParser
{
    private const HEADER_ROW_START  = 5;
    private const ACTIVITY_ROW_START = 9;

    public function sheetId(): string { return 'ANNEX_F'; }
    public function label(): string   { return 'Annex F - Student Discipline'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $committee = $this->str($ws, self::HEADER_ROW_START,     2);
        $procedure = $this->str($ws, self::HEADER_ROW_START + 1, 2);
        $desk      = $this->str($ws, self::HEADER_ROW_START + 2, 2);

        $activities = [];
        $errors     = [];
        $maxRow     = $ws->getHighestDataRow();

        for ($r = self::ACTIVITY_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 3)) continue;

            $activity = $this->str($ws, $r, 1);
            $date     = $this->date_($ws, $r, 2);
            $status   = $this->str($ws, $r, 3);

            if (!$activity) $errors[] = ['row' => $r, 'field' => 'activity', 'message' => 'Activity name is required.'];
            if (!$date)     $errors[] = ['row' => $r, 'field' => 'date',     'message' => 'Invalid or missing date.'];
            if (!$status)   $errors[] = ['row' => $r, 'field' => 'status',   'message' => 'Status is required.'];

            $activities[] = [
                'activity' => $activity ?? '',
                'date'     => $date ?? '',
                'status'   => $status ?? '',
            ];
        }

        $anyData = $committee || $procedure || $desk || count($activities) > 0;

        $payload = [
            'student_discipline_committee' => $committee,
            'procedure_mechanism'          => $procedure,
            'complaint_desk'               => $desk,
            'activities'                   => $activities,
        ];

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: $payload,
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
