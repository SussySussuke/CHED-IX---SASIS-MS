<?php

namespace App\Services\Excel\Sheets;

use App\Models\AnnexFBatch;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnnexFSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex F');
        $ss->addSheet($ws);
        $batch = AnnexFBatch::with('activities')
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $this->applyPageSetup($ws);

        // ── Row 1: tag ────────────────────────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_F]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2-6: title block ─────────────────────────────────────────
        $ws->mergeCells('A2:C2');
        $ws->getRowDimension(2)->setRowHeight(6);
        foreach (['A3:C3', 'A4:C4', 'A5:C5', 'A6:C6'] as $range) {
            $ws->mergeCells($range);
        }
        foreach (['A3', 'A6'] as $cell) {
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A4', 'A5'] as $cell) {
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A3', 'ANNEX "F"');
        $ws->setCellValue('A4', 'LIST OF PROGRAMS/PROJECTS/ACTIVITIES');
        $ws->setCellValue('A5', 'STUDENT DISCIPLINE');
        $ws->setCellValue('A6', 'As of Academic Year (AY) ' . $ay);

        // ── Spacer row 7 ──────────────────────────────────────────────────
        $ws->mergeCells('A7:C7');
        $ws->getRowDimension(7)->setRowHeight(4);

        // ── Row 8: activity table header ──────────────────────────────────
        $ws->setCellValue('A8', 'Activity');
        $ws->setCellValue('B8', 'Date (YYYY-MM-DD)');
        $ws->setCellValue('C8', 'Status');
        $ws->getStyle('A8:C8')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $ws->getRowDimension(8)->setRowHeight(22);

        // ── Activity data rows (row 9+) ───────────────────────────────────
        $row = 9;
        foreach ($batch?->activities ?? [] as $act) {
            $ws->setCellValue('A' . $row, $act->activity);
            $ws->setCellValue('B' . $row, $act->date ?? '');
            $ws->setCellValue('C' . $row, $act->status);
            $row++;
        }

        // ── Key-value fields below activity table (dynamic offset) ────────
        // AnnexFParser scans by label-text match, not fixed row — safe to shift.
        $row += 1;
        $fieldStyle = $this->fieldStyle();
        $kvFields   = [
            ['Composition of Student Discipline Committee', $batch?->student_discipline_committee ?? ''],
            ['Procedure/mechanism to address student grievance', $batch?->procedure_mechanism ?? ''],
            ['Complaint desk', $batch?->complaint_desk ?? ''],
        ];
        foreach ($kvFields as [$lbl, $val]) {
            $ws->mergeCells('A' . $row . ':B' . $row);
            $ws->setCellValue('A' . $row, $lbl);
            $ws->getStyle('A' . $row)->applyFromArray($fieldStyle);
            $ws->setCellValue('C' . $row, $val);
            $ws->getStyle('C' . $row)->applyFromArray(['font' => ['size' => 10], 'alignment' => ['wrapText' => true]]);
            $ws->getStyle('A' . $row . ':C' . $row)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM]],
            ]);
            $ws->getRowDimension($row)->setRowHeight(15.75);
            $row++;
        }

        $ws->getColumnDimension('A')->setWidth(58);
        $ws->getColumnDimension('B')->setWidth(22);
        $ws->getColumnDimension('C')->setWidth(37);
        $ws->freezePane('A9');
    }
}
