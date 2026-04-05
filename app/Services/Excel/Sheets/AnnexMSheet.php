<?php

namespace App\Services\Excel\Sheets;

use App\Models\AnnexMBatch;
use App\Models\AnnexMStatistic;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnnexMSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex M');
        $ss->addSheet($ws);
        $batch = AnnexMBatch::with(['statistics', 'services'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $this->applyPageSetup($ws);

        // ── Row 1: tag ────────────────────────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_M]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2–5: title block ─────────────────────────────────────────
        $ws->mergeCells('A2:G2');
        $ws->getStyle('A2')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->setCellValue('A2', 'ANNEX "M"');
        $ws->getRowDimension(2)->setRowHeight(22);

        foreach (['A3:G3', 'A4:G4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A3', 'HEIs\' INITIATIVES AND DATA ON STUDENTS WITH SPECIAL NEEDS');
        $ws->setCellValue('A4', 'AND PERSONS WITH DISABILITIES');

        $ws->mergeCells('A5:G5');
        $ws->getStyle('A5')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->setCellValue('A5', 'As of Academic Year (AY) ' . $ay);

        // ── Row 6: spacer | Row 7: Table 1 label ─────────────────────────
        $ws->getRowDimension(6)->setRowHeight(4);
        $ws->mergeCells('A7:G7');
        $ws->setCellValue('A7', 'Table 1. Basic Statistics');
        $ws->getStyle('A7')->applyFromArray(['font' => ['bold' => true, 'size' => 10, 'name' => 'Arial']]);

        // ── Row 8: [STATISTICS] tag ───────────────────────────────────────
        $ws->setCellValue('A8', '[STATISTICS]');
        $this->styleTagRow($ws, 'A8');

        // ── Row 9: column headers ─────────────────────────────────────────
        $hdrStyle = $this->hdrStyle();
        $ws->setCellValue('A9', 'Category (based on the DOH Categories)');
        $ws->setCellValue('B9', 'Subcategory');
        $ws->setCellValue('C9', $ay . ' Enrollment');
        $ws->setCellValue('D9', $ay . ' Graduates');
        $ws->getStyle('A9:D9')->applyFromArray($hdrStyle);
        $ws->getRowDimension(9)->setRowHeight(30);

        // ── Statistics data rows ──────────────────────────────────────────
        $categoryStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $subtotalStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2EFD9']],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $dataRowStyle = [
            'font'      => ['size' => 10, 'name' => 'Arial'],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];

        $row          = 10;
        $statistics   = $batch?->statistics?->sortBy('display_order') ?? collect();
        $prevCategory = null;

        $writeStatRow = function (
            string $category, ?string $subcategory, int $enrollment, int $graduates
        ) use ($ws, &$row, &$prevCategory, $categoryStyle, $subtotalStyle, $dataRowStyle): void {
            $isSubtotal    = strtolower(trim((string) $subcategory)) === 'sub-total';
            $isCategoryHdr = $category !== $prevCategory && !$isSubtotal;

            if ($isCategoryHdr) {
                $ws->mergeCells('A' . $row . ':D' . $row);
                $ws->setCellValue('A' . $row, $category);
                $ws->getStyle('A' . $row . ':D' . $row)->applyFromArray($categoryStyle);
                $ws->getRowDimension($row)->setRowHeight(15.75);
                $row++;
                $prevCategory = $category;
            }

            $ws->setCellValue('A' . $row, '');
            $ws->setCellValue('B' . $row, $isSubtotal ? 'Sub-Total' : $subcategory);
            $ws->setCellValue('C' . $row, $enrollment);
            $ws->setCellValue('D' . $row, $graduates);
            $ws->getStyle('A' . $row . ':D' . $row)->applyFromArray($isSubtotal ? $subtotalStyle : $dataRowStyle);
            $ws->getRowDimension($row)->setRowHeight(15.75);
            $row++;
        };

        if ($statistics->isEmpty()) {
            foreach (AnnexMStatistic::STRUCTURE as $group) {
                if (empty($group['subcategories'])) {
                    $writeStatRow($group['category'], null, 0, 0);
                } else {
                    foreach ($group['subcategories'] as $sub) {
                        $writeStatRow($group['category'], $sub, 0, 0);
                    }
                }
                if ($group['has_subtotal']) {
                    $writeStatRow($group['category'], 'Sub-Total', 0, 0);
                }
            }
        } else {
            foreach ($statistics as $stat) {
                $writeStatRow(
                    $stat->category,
                    $stat->subcategory,
                    $stat->year_data[$ay]['enrollment'] ?? 0,
                    $stat->year_data[$ay]['graduates']  ?? 0,
                );
            }
        }

        // ── TOTAL row ─────────────────────────────────────────────────────
        $ws->setCellValue('A' . $row, 'TOTAL');
        $ws->setCellValue('B' . $row, '');
        $ws->setCellValue('C' . $row, '');
        $ws->setCellValue('D' . $row, '');
        $ws->getStyle('A' . $row . ':D' . $row)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFFF00']],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $ws->getRowDimension($row)->setRowHeight(15.75);
        $row++;

        // ── Spacer + Table 2 label ────────────────────────────────────────
        $row++;
        $ws->mergeCells('A' . $row . ':G' . $row);
        $ws->setCellValue('A' . $row, 'Table 2. List of Institutional Services Offered/Programs Implemented/Activities Conducted');
        $ws->getStyle('A' . $row)->applyFromArray(['font' => ['bold' => true, 'size' => 10, 'name' => 'Arial']]);
        $row++;

        // ── [SERVICES] tag + column headers ──────────────────────────────
        $ws->setCellValue('A' . $row, '[SERVICES]');
        $this->styleTagRow($ws, 'A' . $row);
        $row++;

        $svcHdrStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2EFD9']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
        $ws->setCellValue('A' . $row, 'Category of Students with Special Needs');
        $ws->setCellValue('B' . $row, 'Institutional Services offered/ Programs Implemented/ Activities conducted/ and others');
        $ws->setCellValue('C' . $row, 'No. of Beneficiaries/ Participants');
        $ws->setCellValue('D' . $row, 'Remarks, if any');
        $ws->getStyle('A' . $row . ':D' . $row)->applyFromArray($svcHdrStyle);
        $ws->getRowDimension($row)->setRowHeight(27);
        $row++;

        foreach ($batch?->services?->sortBy('display_order') ?? [] as $svc) {
            $ws->setCellValue('A' . $row, $svc->section);
            $ws->setCellValue('B' . $row, $svc->institutional_services_programs_activities);
            $ws->setCellValue('C' . $row, $svc->number_of_beneficiaries_participants);
            $ws->setCellValue('D' . $row, $svc->remarks);
            $ws->getStyle('A' . $row . ':D' . $row)->applyFromArray($dataRowStyle);
            $ws->getRowDimension($row)->setRowHeight(15.75);
            $row++;
        }

        foreach (['A', 'B', 'C', 'D'] as $col) {
            $ws->getColumnDimension($col)->setAutoSize(true);
        }
    }
}
