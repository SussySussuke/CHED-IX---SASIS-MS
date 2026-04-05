<?php

namespace App\Services\Excel\Sheets;

use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

abstract class BaseAnnexSheet
{
    // Colors — all matching the original CHED SASTOOL template
    protected const COLOR_COL_HDR_BG = 'FFC5E0B3'; // light green  — tabular column headers
    protected const COLOR_FIELD_BG   = 'FFDEEAF6'; // light blue   — field labels (D, F, G, H)
    protected const COLOR_TAG_BG     = 'FFFFE699'; // yellow       — machine-readable tag row
    protected const COLOR_WHITE      = 'FFFFFFFF';
    protected const COLOR_TITLE_BLUE = 'FF2F5496'; // dark blue    — LIST OF... / subtitle rows

    /**
     * NOTE: setShowDropDown(false) is NOT a typo — PhpSpreadsheet's flag is inverted:
     * false = show the dropdown arrow in Excel, true = hide it.
     */
    protected function applyYesNoDropdown(Worksheet $ws, string $cell): void
    {
        $validation = $ws->getCell($cell)->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowDropDown(false)
            ->setShowErrorMessage(true)
            ->setErrorTitle('Invalid input')
            ->setError('Please select YES or NO from the dropdown.')
            ->setFormula1('"YES,NO"');
    }

    protected function styleTagRow(Worksheet $ws, string $cell): void
    {
        $ws->getStyle($cell)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);
    }

    protected function applyPageSetup(Worksheet $ws): void
    {
        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);
    }

    protected function hdrStyle(): array
    {
        return [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
    }

    protected function fieldStyle(): array
    {
        return [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
    }

    protected function valueStyle(): array
    {
        return [
            'font'      => ['size' => 10, 'name' => 'Arial'],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
    }
}
