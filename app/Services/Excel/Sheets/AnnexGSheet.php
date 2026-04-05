<?php

namespace App\Services\Excel\Sheets;

use App\Models\AnnexGSubmission;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnnexGSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws  = new Worksheet($ss, 'Annex G');
        $ss->addSheet($ws);
        $sub = AnnexGSubmission::with(['editorialBoards', 'otherPublications', 'programs'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $this->applyPageSetup($ws);

        // Col widths: A=35, B=10 (freq dropdown), C=35, D=10 (type dropdown)
        $ws->getColumnDimension('A')->setWidth(35);
        $ws->getColumnDimension('B')->setWidth(10);
        $ws->getColumnDimension('C')->setWidth(35);
        $ws->getColumnDimension('D')->setWidth(10);

        // ── Row 1: tag ────────────────────────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_G]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2–5: title block ─────────────────────────────────────────
        $ws->mergeCells('A2:D2');
        $ws->getStyle('A2')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        foreach (['A3:D3', 'A4:D4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->mergeCells('A5:D5');
        $ws->getStyle('A5')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->setCellValue('A2', 'ANNEX "G"');
        $ws->setCellValue('A3', 'IMPLEMENTATION OF REPUBLIC ACT (R.A.) NO. 7079');
        $ws->setCellValue('A4', 'CAMPUS JOURNALISM ACT OF 1991');
        $ws->setCellValue('A5', 'As of Academic Year (AY) ' . $ay);
        $ws->getRowDimension(2)->setRowHeight(22);
        $ws->getRowDimension(6)->setRowHeight(4);

        $fieldStyle = $this->fieldStyle();
        $valueStyle = $this->valueStyle();
        $yn = fn(?bool $v): string => $v ? 'YES' : 'NO';

        // ── Row 7: school name (A:B) | fee (C:D) ─────────────────────────
        $ws->mergeCells('A7:B7');
        $ws->setCellValue('A7', 'Name of Official School/ Institutional Student Publication: ' . ($sub?->official_school_name ?? ''));
        $ws->mergeCells('C7:D7');
        $ws->setCellValue('C7', 'Publication Fee per student: ' . ($sub?->publication_fee_per_student ?? ''));
        $ws->getStyle('A7')->applyFromArray($fieldStyle);
        $ws->getStyle('C7')->applyFromArray($fieldStyle);
        $ws->getRowDimension(7)->setRowHeight(15.75);

        // ── Row 8: student publication name ──────────────────────────────
        $ws->mergeCells('A8:D8');
        $ws->setCellValue('A8', 'Name of Student Publication: ' . ($sub?->student_publication_name ?? ''));
        $ws->getStyle('A8')->applyFromArray($fieldStyle);
        $ws->getRowDimension(8)->setRowHeight(15.75);

        // ── Row 9: section headers ────────────────────────────────────────
        $ws->mergeCells('A9:B9');
        $ws->setCellValue('A9', 'Circulation Period:');
        $ws->mergeCells('C9:D9');
        $ws->setCellValue('C9', 'Type of Publication:');
        $ws->getStyle('A9')->applyFromArray($fieldStyle);
        $ws->getStyle('C9')->applyFromArray($fieldStyle);
        $ws->getRowDimension(9)->setRowHeight(18);

        // ── Rows 10–14: freq (A label + B dropdown) | type (C label + D dropdown) ─
        // Parser: frequency_* = bool_(ws,r,2)  publication_type_* = bool_(ws,r,4)
        $freqRows = [
            10 => [$sub?->frequency_monthly,      'Monthly'],
            11 => [$sub?->frequency_quarterly,    'Quarterly'],
            12 => [$sub?->frequency_annual,       'Annual'],
            13 => [$sub?->frequency_per_semester, 'Per Semester'],
            14 => [$sub?->frequency_others,       'Others, please specify: ' . ($sub?->frequency_others_specify ?? '')],
        ];
        $typeRows = [
            10 => [$sub?->publication_type_newsletter, 'Newsletter'],
            11 => [$sub?->publication_type_gazette,    'Gazette'],
            12 => [$sub?->publication_type_magazine,   'Magazine'],
            13 => [$sub?->publication_type_others,     'Others, please specify: ' . ($sub?->publication_type_others_specify ?? '')],
        ];

        foreach ($freqRows as $r => [$val, $label]) {
            $ws->setCellValue('A' . $r, $label);
            $ws->setCellValue('B' . $r, $yn($val));
            $this->applyYesNoDropdown($ws, 'B' . $r);
            $ws->getStyle('A' . $r)->applyFromArray($fieldStyle);
            $ws->getStyle('B' . $r)->applyFromArray($valueStyle);
            $ws->getRowDimension($r)->setRowHeight(15.75);
        }
        foreach ($typeRows as $r => [$val, $label]) {
            $ws->setCellValue('C' . $r, $label);
            $ws->setCellValue('D' . $r, $yn($val));
            $this->applyYesNoDropdown($ws, 'D' . $r);
            $ws->getStyle('C' . $r)->applyFromArray($fieldStyle);
            $ws->getStyle('D' . $r)->applyFromArray($valueStyle);
        }

        // ── Rows 15–18: spacer + Table 1 header + adviser fields ─────────
        $ws->getRowDimension(15)->setRowHeight(4);
        $ws->mergeCells('A16:D16');
        $ws->setCellValue('A16', 'Table 1. Composition of Editorial Board of the University-Wide publication');
        $ws->getStyle('A16')->applyFromArray($fieldStyle);
        $ws->getRowDimension(16)->setRowHeight(15.75);

        $ws->setCellValue('A17', 'Name of Adviser:');
        $ws->mergeCells('B17:D17');
        $ws->setCellValue('B17', $sub?->adviser_name ?? '');
        $ws->getStyle('A17')->applyFromArray($fieldStyle);
        $ws->getStyle('B17')->applyFromArray($valueStyle);
        $ws->getRowDimension(17)->setRowHeight(15.75);

        $ws->setCellValue('A18', 'Position/Designation:');
        $ws->mergeCells('B18:D18');
        $ws->setCellValue('B18', $sub?->adviser_position_designation ?? '');
        $ws->getStyle('A18')->applyFromArray($fieldStyle);
        $ws->getStyle('B18')->applyFromArray($valueStyle);
        $ws->getRowDimension(18)->setRowHeight(15.75);

        $nextRow   = 20;
        $hdrStyle  = $this->hdrStyle();

        // ── [EDITORIAL_BOARD] sub-table ───────────────────────────────────
        $ws->setCellValue('A' . $nextRow, '[EDITORIAL_BOARD]');
        $this->styleTagRow($ws, 'A' . $nextRow);
        $nextRow++;
        $ws->setCellValue('A' . $nextRow, 'Name');
        $ws->setCellValue('B' . $nextRow, 'Position in Editorial Board');
        $ws->setCellValue('C' . $nextRow, 'Degree Program & Year Level');
        $ws->getStyle('A' . $nextRow . ':C' . $nextRow)->applyFromArray($hdrStyle);
        $ws->getRowDimension($nextRow)->setRowHeight(22);
        $nextRow++;
        foreach ($sub?->editorialBoards ?? [] as $eb) {
            $ws->setCellValue('A' . $nextRow, $eb->name);
            $ws->setCellValue('B' . $nextRow, $eb->position_in_editorial_board);
            $ws->setCellValue('C' . $nextRow, $eb->degree_program_year_level);
            $nextRow++;
        }
        $nextRow++;

        // ── [OTHER_PUBLICATIONS] sub-table ────────────────────────────────
        $ws->setCellValue('A' . $nextRow, '[OTHER_PUBLICATIONS]');
        $this->styleTagRow($ws, 'A' . $nextRow);
        $nextRow++;
        $ws->setCellValue('A' . $nextRow, 'Name of Publication');
        $ws->setCellValue('B' . $nextRow, 'Department/Unit in Charge');
        $ws->setCellValue('C' . $nextRow, 'Type of Publication');
        $ws->getStyle('A' . $nextRow . ':C' . $nextRow)->applyFromArray($hdrStyle);
        $ws->getRowDimension($nextRow)->setRowHeight(22);
        $nextRow++;
        foreach ($sub?->otherPublications ?? [] as $op) {
            $ws->setCellValue('A' . $nextRow, $op->name_of_publication);
            $ws->setCellValue('B' . $nextRow, $op->department_unit_in_charge);
            $ws->setCellValue('C' . $nextRow, $op->type_of_publication);
            $nextRow++;
        }
        $nextRow++;

        // ── [PROGRAMS] sub-table ──────────────────────────────────────────
        $ws->setCellValue('A' . $nextRow, '[PROGRAMS]');
        $this->styleTagRow($ws, 'A' . $nextRow);
        $nextRow++;
        $ws->setCellValue('A' . $nextRow, 'Title of Program');
        $ws->setCellValue('B' . $nextRow, 'Date (YYYY-MM-DD)');
        $ws->setCellValue('C' . $nextRow, 'Venue');
        $ws->setCellValue('D' . $nextRow, 'Target Group of Participants');
        $ws->getStyle('A' . $nextRow . ':D' . $nextRow)->applyFromArray($hdrStyle);
        $ws->getRowDimension($nextRow)->setRowHeight(22);
        $nextRow++;
        foreach ($sub?->programs ?? [] as $prog) {
            $ws->setCellValue('A' . $nextRow, $prog->title_of_program);
            $ws->setCellValue('B' . $nextRow, $prog->implementation_date ?? '');
            $ws->setCellValue('C' . $nextRow, $prog->implementation_venue);
            $ws->setCellValue('D' . $nextRow, $prog->target_group_of_participants);
            $nextRow++;
        }
    }
}
