<?php

namespace App\Services\Excel\Sheets;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InstructionsSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, string $ay): void
    {
        $ws = new Worksheet($ss, 'INSTRUCTIONS');
        $ss->addSheet($ws, 0);

        $ws->setCellValue('A1', 'SAS PROGRAMS AND SERVICES REPORT — IMPORT TEMPLATE');
        $ws->setCellValue('A2', 'Academic Year: ' . $ay);
        $ws->setCellValue('A4', 'HOW TO FILL IN THIS TEMPLATE');
        $ws->setCellValue('A5', '1. Each sheet corresponds to one Annex form. Fill in data after the green header rows (row 8 or 9 depending on the sheet).');
        $ws->setCellValue('A6', '2. Do NOT change the first row of any sheet — it is a machine-readable tag used during import.');
        $ws->setCellValue('A7', '3. Do NOT rename the sheet tabs.');
        $ws->setCellValue('A8', '4. Date fields must be in YYYY-MM-DD format.');
        $ws->setCellValue('A9', '5. YES/NO fields: enter YES or NO only.');
        $ws->setCellValue('A10', '6. Empty sheets are automatically skipped during import.');
        $ws->setCellValue('A11', '7. If a sheet already has data in the system, you will be asked whether to overwrite it.');
        $ws->setCellValue('A12', '8. Signatures are NOT required in this template.');

        $ws->getColumnDimension('A')->setWidth(90);
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => self::COLOR_WHITE]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1F3864']],
        ]);
        $ws->getStyle('A4')->applyFromArray([
            'font' => ['bold' => true],
        ]);

        $ws->getSheetView()->setZoomScale(110);
    }
}
