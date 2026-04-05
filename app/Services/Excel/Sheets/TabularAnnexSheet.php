<?php

namespace App\Services\Excel\Sheets;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Generic tabular sheet — handles A, B, C, C-1, E, I, I-1, J, K, L, L-1, N, N-1, O
 *
 * Header structure mirrors the original CHED SASTOOL template:
 *   Row 1: [TAG] — yellow, machine-readable import tag
 *   Row 2: ANNEX "X" — bold, plain black, merged
 *   Row 3: LIST OF PROGRAMS/PROJECTS/ACTIVITIES — bold, merged
 *   Row 4: form sub-title — bold, merged
 *   Row 5: AY line — bold, merged
 *   Row 6: spacer
 *   Row 7: column headers — light green, bold
 *   Row 8: optional cosmetic sub-row (example hints) — same green bg
 *   Row 8 or 9+: data rows
 */
class TabularAnnexSheet extends BaseAnnexSheet
{
    public function attach(
        Spreadsheet $ss,
        string $tag,
        string $tabName,
        string $title,
        array $headers,
        array $rows,
        string $academicYear = '',
        array $subRow = [],
        array $subRowMerges = [],
        string $headerColor = self::COLOR_COL_HDR_BG,
        array $yesNoCols = [],
    ): void {
        $ws = new Worksheet($ss, $tabName);
        $ss->addSheet($ws);

        $lastColIdx = count($headers);
        $lastCol    = Coordinate::stringFromColumnIndex($lastColIdx);

        $this->applyPageSetup($ws);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[' . $tag . ']');
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);

        // ── Rows 2–5: title block (plain bold, centered, no fill) ─────────
        // Rows 2 & 5: black — ANNEX "X" and AY line
        foreach (['A2', 'A5'] as $cell) {
            $ws->mergeCells($cell . ':' . $lastCol . $cell[1]);
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        // Rows 3 & 4: dark blue — LIST OF... and subtitle
        foreach (['A3', 'A4'] as $cell) {
            $ws->mergeCells($cell . ':' . $lastCol . $cell[1]);
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }

        // "Annex C-1" → 'ANNEX "C-1"'
        $annexLabel = strtoupper(preg_replace('/^Annex\s+/i', 'ANNEX "', $tabName)) . '"';
        $ws->setCellValue('A2', $annexLabel);
        $ws->setCellValue('A3', 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES');
        $ws->setCellValue('A4', strtoupper($title));
        $ws->setCellValue('A5', 'As of Academic Year (AY) ' . $academicYear);

        // ── Row 6: spacer ─────────────────────────────────────────────────
        $ws->getRowDimension(6)->setRowHeight(4);

        // ── Row 7: column headers ─────────────────────────────────────────
        foreach ($headers as $i => $header) {
            $col = Coordinate::stringFromColumnIndex($i + 1);
            $ws->setCellValue($col . '7', $header);
        }
        $ws->getStyle('A7:' . $lastCol . '7')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $headerColor]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $ws->getRowDimension(7)->setRowHeight(30);

        // ── Row 8: optional cosmetic sub-row ─────────────────────────────
        if (!empty($subRow)) {
            foreach ($subRow as $colIdx => $text) {
                $col = Coordinate::stringFromColumnIndex($colIdx);
                $ws->setCellValue($col . '8', $text);
            }
            foreach ($subRowMerges as [$mergeStart, $mergeEnd]) {
                $startCol = Coordinate::stringFromColumnIndex($mergeStart);
                $endCol   = Coordinate::stringFromColumnIndex($mergeEnd);
                $ws->mergeCells($startCol . '8:' . $endCol . '8');
            }
            $ws->getStyle('A8:' . $lastCol . '8')->applyFromArray([
                'font'      => ['size' => 10, 'bold' => false, 'italic' => true, 'name' => 'Arial'],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $headerColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getRowDimension(8)->setRowHeight(20);
        }

        // ── Data rows ─────────────────────────────────────────────────────
        $rowNum = empty($subRow) ? 8 : 9;
        foreach ($rows as $row) {
            foreach (array_values($row) as $i => $val) {
                $colIdx = $i + 1;
                $col    = Coordinate::stringFromColumnIndex($colIdx);
                $ws->setCellValue($col . $rowNum, $val ?? '');
                $ws->getStyle($col . $rowNum)->applyFromArray([
                    'font'      => ['name' => 'Arial', 'size' => 10],
                    'alignment' => ['wrapText' => true],
                ]);
                if (in_array($colIdx, $yesNoCols, true)) {
                    $this->applyYesNoDropdown($ws, $col . $rowNum);
                }
            }
            $ws->getRowDimension($rowNum)->setRowHeight(15.75);
            $rowNum++;
        }

        foreach (range(1, $lastColIdx) as $colIdx) {
            $ws->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
        }

        $ws->freezePane('A' . (empty($subRow) ? 8 : 9));
    }
}
