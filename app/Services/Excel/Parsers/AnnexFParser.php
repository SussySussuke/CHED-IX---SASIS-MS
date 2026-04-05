<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex F — Student Discipline
 *
 * Export layout:
 *   Row 1:  [ANNEX_F] tag
 *   Rows 2–6: title block
 *   Row 7:  spacer
 *   Row 8:  activity table header (Activity | Date | Status)
 *   Row 9+: activity data rows
 *   Below activity table (dynamic row): KV fields
 *     Col A (merged A:B) = label, Col C = value
 *     Labels: 'Composition of Student Discipline Committee'
 *             'Procedure/mechanism to address student grievance'
 *             'Complaint desk'
 *
 * The KV fields are NOT at fixed rows — they follow the last activity row.
 * Parser scans all rows for them by label match.
 * Date is nullable in the DB — missing date is NOT a hard error.
 */
class AnnexFParser extends BaseParser
{
    private const ACTIVITY_ROW_START = 9;

    // Label text as written by ExcelExportService (col A, value in col C)
    private const KV_LABELS = [
        'student_discipline_committee' => 'Composition of Student Discipline Committee',
        'procedure_mechanism'          => 'Procedure/mechanism to address student grievance',
        'complaint_desk'               => 'Complaint desk',
    ];

    public function sheetId(): string { return 'ANNEX_F'; }
    public function label(): string   { return 'Annex F - Student Discipline'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $activities = [];
        $errors     = [];
        $maxRow     = $ws->getHighestDataRow();

        // KV fields — keyed by field name, filled by label-scan
        $kv = [
            'student_discipline_committee' => null,
            'procedure_mechanism'          => null,
            'complaint_desk'               => null,
        ];

        // Build a lowercase label → field-name map for fast lookup
        $kvMap = [];
        foreach (self::KV_LABELS as $field => $label) {
            $kvMap[strtolower(trim($label))] = $field;
        }

        for ($r = self::ACTIVITY_ROW_START; $r <= $maxRow; $r++) {
            if ($this->isRowBlank($ws, $r, 1, 3)) continue;

            $col1 = $this->str($ws, $r, 1);

            // Check if this row is a KV field (label in col A, value in col C)
            $normalized = strtolower(trim((string) $col1));
            if (isset($kvMap[$normalized])) {
                $kv[$kvMap[$normalized]] = $this->str($ws, $r, 3);
                continue;
            }

            // Otherwise treat as an activity data row
            $activity = $col1;
            $date     = $this->date_($ws, $r, 2);
            $status   = $this->str($ws, $r, 3);

            // Only activity name is required — date and status are nullable
            if (!$activity) {
                $errors[] = ['row' => $r, 'field' => 'activity', 'message' => 'Activity name is required.'];
            }

            $activities[] = [
                'activity' => $activity ?? '',
                'date'     => $date ?? '',
                'status'   => $status ?? '',
            ];
        }

        $anyData = array_filter($kv) || count($activities) > 0;

        $payload = array_merge($kv, ['activities' => $activities]);

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: $payload,
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
