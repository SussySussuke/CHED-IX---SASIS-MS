<?php

namespace App\Services\Excel\Sheets;

use App\Models\AnnexDSubmission;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnnexDSheet extends BaseAnnexSheet
{
    public function attach(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws  = new Worksheet($ss, 'Annex D');
        $ss->addSheet($ws);
        $sub = AnnexDSubmission::where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $this->applyPageSetup($ws);

        // Col widths: A=55 (label), B=12 (dropdown), C=65 (text/overflow), D=10 (type dropdowns)
        $ws->getColumnDimension('A')->setWidth(55);
        $ws->getColumnDimension('B')->setWidth(12);
        $ws->getColumnDimension('C')->setWidth(65);
        $ws->getColumnDimension('D')->setWidth(10);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_D]');
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);

        // ── Rows 2–4: title block ──────────────────────────────────────────
        $ws->mergeCells('A2:C2');
        $ws->mergeCells('A3:C3');
        $ws->mergeCells('A4:C4');
        $ws->getStyle('A2')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->getStyle('A3')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->getStyle('A4')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->setCellValue('A2', 'ANNEX "D"');
        $ws->setCellValue('A3', 'UPDATES ON STUDENT HANDBOOK/MANUAL');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);

        $fieldStyle    = $this->fieldStyle();
        $boldFieldStyle = array_merge_recursive($fieldStyle, ['font' => ['bold' => true]]);
        $valueStyle    = $this->valueStyle();
        $yn = fn(?bool $v): string => $v ? 'YES' : 'NO';

        // ── Rows 5–10: text fields (label+value merged A:C) ───────────────
        $ws->mergeCells('A5:C5');
        $ws->setCellValue('A5', 'Version/ Publication date: ' . ($sub?->version_publication_date ?? ''));
        $ws->getStyle('A5')->applyFromArray($fieldStyle);
        $ws->getRowDimension(5)->setRowHeight(15.75);
        $ws->getRowDimension(6)->setRowHeight(4);

        $ws->mergeCells('A7:C7');
        $ws->getRowDimension(7)->setRowHeight(4);
        $ws->mergeCells('A8:C8');
        $ws->setCellValue('A8', 'Officer-in-Charge: ' . ($sub?->officer_in_charge ?? ''));
        $ws->getStyle('A8')->applyFromArray($fieldStyle);
        $ws->getRowDimension(8)->setRowHeight(15.75);

        $ws->mergeCells('A9:C9');
        $ws->getRowDimension(9)->setRowHeight(4);
        $ws->mergeCells('A10:C10');
        $ws->setCellValue('A10', 'Composition of the Student Handbook Committee: ' . ($sub?->handbook_committee ?? ''));
        $ws->getStyle('A10')->applyFromArray($fieldStyle);
        $ws->getRowDimension(10)->setRowHeight(25.5);
        $ws->getRowDimension(11)->setRowHeight(4);

        // ── Row 12: section headers ────────────────────────────────────────
        $ws->mergeCells('A12:B12');
        $ws->setCellValue('A12', 'Mode of Dissemination');
        $ws->setCellValue('C12', 'Type of Student Handbook/Manual:');
        $ws->getStyle('A12')->applyFromArray($boldFieldStyle);
        $ws->getStyle('C12')->applyFromArray($boldFieldStyle);
        $ws->getRowDimension(12)->setRowHeight(15.75);

        // ── Rows 13–18: dissemination (col B dropdown) + type (col D dropdown) ──
        // Parser reads: dissem_checkbox = bool_(ws,r,2)  type_checkbox = bool_(ws,r,4)

        // Row 13
        $ws->setCellValue('A13', 'Orientation');
        $ws->setCellValue('B13', $yn($sub?->dissemination_orientation));
        $this->applyYesNoDropdown($ws, 'B13');
        $ws->setCellValue('C13', 'Digital Copy');
        $ws->setCellValue('D13', $yn($sub?->type_digital));
        $this->applyYesNoDropdown($ws, 'D13');
        $ws->getStyle('A13')->applyFromArray($fieldStyle);
        $ws->getStyle('B13')->applyFromArray($valueStyle);
        $ws->getStyle('C13')->applyFromArray($fieldStyle);
        $ws->getStyle('D13')->applyFromArray($valueStyle);
        $ws->getRowDimension(13)->setRowHeight(15.75);

        // Row 14
        $ws->setCellValue('A14', 'Date/s of Orientation:');
        $ws->setCellValue('B14', $sub?->orientation_dates ?? '');
        $ws->setCellValue('C14', 'Printed');
        $ws->setCellValue('D14', $yn($sub?->type_printed));
        $this->applyYesNoDropdown($ws, 'D14');
        $ws->getStyle('A14')->applyFromArray($fieldStyle);
        $ws->getStyle('B14')->applyFromArray($valueStyle);
        $ws->getStyle('C14')->applyFromArray($fieldStyle);
        $ws->getStyle('D14')->applyFromArray($valueStyle);
        $ws->getRowDimension(14)->setRowHeight(15.75);

        // Row 15
        $ws->setCellValue('A15', 'Mode of delivery (F2F/online or both):');
        $ws->setCellValue('B15', $sub?->mode_of_delivery ?? '');
        $ws->setCellValue('C15', 'Others, please specify:');
        $ws->setCellValue('D15', $yn($sub?->type_others));
        $this->applyYesNoDropdown($ws, 'D15');
        $ws->getStyle('A15')->applyFromArray($fieldStyle);
        $ws->getStyle('B15')->applyFromArray($valueStyle);
        $ws->getStyle('C15')->applyFromArray($fieldStyle);
        $ws->getStyle('D15')->applyFromArray($valueStyle);
        $ws->getRowDimension(15)->setRowHeight(15.75);

        // Row 16: type_others_text
        $ws->setCellValue('C16', $sub?->type_others_text ?? '');
        $ws->getStyle('C16')->applyFromArray($valueStyle);
        $ws->getRowDimension(16)->setRowHeight(15.75);

        // Row 17
        $ws->setCellValue('A17', 'Uploaded in Website');
        $ws->setCellValue('B17', $yn($sub?->dissemination_uploaded));
        $this->applyYesNoDropdown($ws, 'B17');
        $ws->getStyle('A17')->applyFromArray($fieldStyle);
        $ws->getStyle('B17')->applyFromArray($valueStyle);
        $ws->getRowDimension(17)->setRowHeight(15.75);

        // Row 18
        $ws->setCellValue('A18', 'Others, please specify:');
        $ws->setCellValue('B18', $yn($sub?->dissemination_others));
        $this->applyYesNoDropdown($ws, 'B18');
        $ws->setCellValue('C18', $sub?->dissemination_others_text ?? '');
        $ws->getStyle('A18')->applyFromArray($fieldStyle);
        $ws->getStyle('B18')->applyFromArray($valueStyle);
        $ws->getStyle('C18')->applyFromArray($valueStyle);
        $ws->getRowDimension(18)->setRowHeight(15.75);

        // ── Row 19: spacer ────────────────────────────────────────────────
        $ws->getRowDimension(19)->setRowHeight(4);

        // ── Row 20: section header ────────────────────────────────────────
        $ws->mergeCells('A20:D20');
        $ws->setCellValue('A20', 'Contains the following information (check all applicable items/information):');
        $ws->getStyle('A20')->applyFromArray($boldFieldStyle);
        $ws->getRowDimension(20)->setRowHeight(25.5);

        // ── Rows 21–38: label (A:C merged) | YES/NO dropdown (D) ─────────
        // Parser reads: bool_(ws, r, 4)
        $checkboxItems = [
            21 => [$sub?->has_academic_policies,      'Academic and Institutional Policies'],
            22 => [$sub?->has_admission_requirements,  'Admission requirements'],
            23 => [$sub?->has_code_of_conduct,         'Student Code of Conduct and Discipline'],
            24 => [$sub?->has_scholarships,            'scholarships/financial assistance'],
            25 => [$sub?->has_student_publication,     'student publication'],
            26 => [$sub?->has_housing_services,        'housing services/dormitories (if applicable)'],
            27 => [$sub?->has_disability_services,     'services for learners with disabilities and special needs'],
            28 => [$sub?->has_student_council,         'student council/government/organizations'],
            29 => [$sub?->has_refund_policies,         'Refund policies'],
            30 => [$sub?->has_drug_education,          'Drug Education, prevention and control'],
            31 => [$sub?->has_foreign_students,        'Foreign students (if applicable)'],
            32 => [$sub?->has_disaster_management,     'Disaster Risk Reduction and Management'],
            33 => [$sub?->has_safe_spaces,             'Safe Spaces Act'],
            34 => [$sub?->has_anti_hazing,             'Anti-Hazing Act'],
            35 => [$sub?->has_anti_bullying,           'Anti-Bullying Act'],
            36 => [$sub?->has_violence_against_women,  'Violence against women and their children'],
            37 => [$sub?->has_gender_fair,             'Gender-fair education'],
            38 => [$sub?->has_others,                  'Others, please specify'],
        ];

        foreach ($checkboxItems as $r => [$val, $label]) {
            $ws->mergeCells('A' . $r . ':C' . $r);
            $ws->setCellValue('A' . $r, $label);
            $ws->setCellValue('D' . $r, $yn($val));
            $this->applyYesNoDropdown($ws, 'D' . $r);
            $ws->getStyle('A' . $r)->applyFromArray($fieldStyle);
            $ws->getStyle('D' . $r)->applyFromArray($valueStyle);
            $ws->getRowDimension($r)->setRowHeight(15.75);
        }

        // Row 39: free-text for has_others_text
        $ws->mergeCells('A39:D39');
        $ws->setCellValue('A39', $sub?->has_others_text ?? '');
        $ws->getStyle('A39')->applyFromArray($valueStyle);
        $ws->getRowDimension(39)->setRowHeight(15.75);

        $ws->getPageSetup()->setPrintArea('A1:D39');
        $ws->freezePane('A21');
    }
}
