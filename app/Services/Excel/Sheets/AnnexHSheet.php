<?php

namespace App\Services\Excel\Sheets;

use App\Models\AnnexHAdmissionService;
use App\Models\AnnexHBatch;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnnexHSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex H');
        $ss->addSheet($ws);
        $batch = AnnexHBatch::with(['admissionServices', 'admissionStatistics'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $this->applyPageSetup($ws);

        // ── Row 1: tag ────────────────────────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_H]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2–4: title block ─────────────────────────────────────────
        foreach (['A2:D2', 'A4:D4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->mergeCells('A3:D3');
        $ws->getStyle('A3')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->setCellValue('A2', 'ANNEX "H"');
        $ws->setCellValue('A3', 'LIST OF ADMISSION SERVICES/ REQUIREMENTS');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);
        $ws->getRowDimension(2)->setRowHeight(22);

        $hdrStyle = $this->hdrStyle();

        // ── Row 5: column headers ─────────────────────────────────────────
        $ws->setCellValue('A5', 'Service Type');
        $ws->setCellValue('B5', 'Check (YES/NO)');
        $ws->setCellValue('C5', 'Supporting Documents');
        $ws->setCellValue('D5', 'Remarks');
        $ws->getStyle('A5:D5')->applyFromArray($hdrStyle);
        $ws->getRowDimension(5)->setRowHeight(22);

        // ── Rows 6–10: service data rows (SERVICES_ROW_START = 6) ─────────
        // Parser uses PREDEFINED_SERVICES constant for service_type, ignores col A.
        $serviceMap = [];
        foreach ($batch?->admissionServices ?? [] as $svc) {
            $serviceMap[strtolower(trim((string) $svc->service_type))] = $svc;
        }

        foreach (AnnexHAdmissionService::PREDEFINED_SERVICES as $i => $serviceType) {
            $r   = $i + 6;
            $svc = $serviceMap[strtolower(trim($serviceType))] ?? null;
            $ws->setCellValue('A' . $r, $serviceType);
            $ws->setCellValue('B' . $r, $svc !== null ? ($svc->with ? 'YES' : 'NO') : '');
            $ws->setCellValue('C' . $r, $svc?->supporting_documents ?? '');
            $ws->setCellValue('D' . $r, $svc?->remarks ?? '');
            $this->applyYesNoDropdown($ws, 'B' . $r);
            $ws->getStyle('A' . $r)->applyFromArray([
                'font' => ['size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getRowDimension($r)->setRowHeight(15.75);
        }

        // ── Row 11: spacer ────────────────────────────────────────────────
        $ws->getRowDimension(11)->setRowHeight(4);

        // ── Row 12: stats column headers (STATS_ROW_START = 13) ──────────
        $ws->setCellValue('A12', 'Program/Department');
        $ws->setCellValue('B12', 'No. of Applicants');
        $ws->setCellValue('C12', 'No. Admitted');
        $ws->setCellValue('D12', 'No. Enrolled');
        $ws->getStyle('A12:D12')->applyFromArray($hdrStyle);
        $ws->getRowDimension(12)->setRowHeight(22);

        // ── Rows 13+: admission statistics ───────────────────────────────
        $row = 13;
        foreach ($batch?->admissionStatistics ?? [] as $stat) {
            $ws->setCellValue('A' . $row, $stat->program);
            $ws->setCellValue('B' . $row, $stat->applicants);
            $ws->setCellValue('C' . $row, $stat->admitted);
            $ws->setCellValue('D' . $row, $stat->enrolled);
            $row++;
        }

        foreach (['A', 'B', 'C', 'D'] as $col) {
            $ws->getColumnDimension($col)->setAutoSize(true);
        }
    }
}
