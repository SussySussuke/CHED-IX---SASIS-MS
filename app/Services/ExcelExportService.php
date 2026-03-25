<?php

namespace App\Services;

use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexCBatch;
use App\Models\AnnexDSubmission;
use App\Models\AnnexEBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexGSubmission;
use App\Models\AnnexHAdmissionService;
use App\Models\AnnexHBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexIBatch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexLBatch;
use App\Models\AnnexMBatch;
use App\Models\AnnexMStatistic;
use App\Models\AnnexN1Batch;
use App\Models\AnnexNBatch;
use App\Models\AnnexOBatch;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExcelExportService
{
    // Colors — all matching the original CHED SASTOOL template
    private const COLOR_COL_HDR_BG  = 'FFC5E0B3'; // light green — tabular column headers (CHED original)
    private const COLOR_FIELD_BG    = 'FFDEEAF6'; // light blue  — field labels: Annex D, F, G, H (CHED original)
    private const COLOR_TAG_BG      = 'FFFFE699'; // yellow — machine-readable import tag row
    private const COLOR_WHITE       = 'FFFFFFFF';
    private const COLOR_TITLE_BLUE  = 'FF2F5496'; // dark blue — LIST OF... and subtitle rows (CHED original)

    public function downloadTemplate(int $heiId, string $academicYear): StreamedResponse
    {
        $spreadsheet = $this->buildSpreadsheet($heiId, $academicYear);

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="SAS_Template_' . $academicYear . '.xlsx"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    public function downloadEmptyTemplate(string $academicYear): StreamedResponse
    {
        // heiId 0 matches no DB records — all fetchers return empty arrays naturally.
        $spreadsheet = $this->buildSpreadsheet(0, $academicYear);

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="SAS_Template_' . $academicYear . '_blank.xlsx"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    // ── build ──────────────────────────────────────────────────────────────

    private function buildSpreadsheet(int $heiId, string $academicYear): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getDefaultStyle()->getFont()->setName('Arial')->setSize(10);
        $spreadsheet->removeSheetByIndex(0); // remove default empty sheet

        $this->addInstructionsSheet($spreadsheet, $academicYear);

        $this->addTabularSheet($spreadsheet, 'ANNEX_A', 'Annex A', 'Information and Orientation Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexAData($heiId, $academicYear), $academicYear,
            subRow: [4 => '(e.g. faculty, students, graduating class, etc.)']
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_B', 'Annex B', 'Guidance and Counseling Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexBData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(list all services provided)', 4 => '(e.g. faculty, students, graduating class, etc.)']
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_C', 'Annex C', 'Career and Job Placement Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexCData($heiId, $academicYear), $academicYear
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_C1', 'Annex C-1', 'Economic Enterprise Development',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexC1Data($heiId, $academicYear), $academicYear
        );

        $this->addAnnexDSheet($spreadsheet, $heiId, $academicYear);

        $this->addTabularSheet($spreadsheet, 'ANNEX_E', 'Annex E', 'Student Organizations',
            ['Name of Org/Council/Govt', 'Years of Existence', 'Accredited Since', 'Faculty Adviser', 'President/Officers', 'Specialization', 'Fee Collected', 'Programs/Activities'],
            $this->fetchAnnexEData($heiId, $academicYear), $academicYear,
            subRow: [
                5 => '(please use additional sheet of paper, if necessary)',
                6 => '(e.g. Drug Education, Academic, Community Services, Environmental Awareness, Peer Counseling, Tutorial Services, others)',
            ]
        );

        $this->addAnnexFSheet($spreadsheet, $heiId, $academicYear);
        $this->addAnnexGSheet($spreadsheet, $heiId, $academicYear);
        $this->addAnnexHSheet($spreadsheet, $heiId, $academicYear);

        $this->addTabularSheet($spreadsheet, 'ANNEX_I', 'Annex I', 'Scholarships/Financial Assistance',
            ['Scholarship Name', 'Type', 'Category/Beneficiaries', 'Number of Beneficiaries', 'Remarks'],
            $this->fetchAnnexIData($heiId, $academicYear), $academicYear,
            subRow: [
                2 => '(Institutional, Scholarship, Grant, Loan, etc.)',
                3 => '(e.g. PWD, IPs, 4Ps, Solo Parent/ Dependent of Solo Parent, etc.)',
            ]
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_I1', 'Annex I-1', 'Food Services',
            ['Service/Facility Name', 'Type of Service', 'Operator', 'Location', 'Students Served Daily', 'Remarks'],
            $this->fetchAnnexI1Data($heiId, $academicYear), $academicYear
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_J', 'Annex J', 'Health Services',
            ['Title of Program', 'Organizer', 'Participants (Online)', 'Participants (F2F)', 'Remarks'],
            $this->fetchAnnexJData($heiId, $academicYear), $academicYear
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_K', 'Annex K', 'Safety and Security Committees',
            ['Committee Name', 'Committee Head', 'Members/Composition', 'Programs/Activities/Trainings', 'Remarks'],
            $this->fetchAnnexKData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(fill-in applicable)']
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_L', 'Annex L', 'Student Housing',
            ['Housing Name', 'Complete Address', 'House Manager', 'Type: Male', 'Type: Female', 'Type: Coed (M+F)', 'Others (specify)', 'Remarks'],
            $this->fetchAnnexLData($heiId, $academicYear), $academicYear,
            subRow: [
                4 => 'YES / NO',
                5 => 'YES / NO',
                6 => 'YES / NO',
            ]
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_L1', 'Annex L-1', 'Foreign/International Student Services',
            ['Service Name', 'Type of Service', 'Target Nationality', 'Students Served', 'Officer-in-Charge', 'Remarks'],
            $this->fetchAnnexL1Data($heiId, $academicYear), $academicYear
        );

        $this->addAnnexMSheet($spreadsheet, $heiId, $academicYear);

        $this->addTabularSheet($spreadsheet, 'ANNEX_N', 'Annex N', 'Culture and the Arts',
            ['Title of Activity', 'Date (YYYY-MM-DD)', 'Venue', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexNData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(e.g. dance troupe, choir, cheering squad and other extra-curricular activities)'],
            subRowMerges: [],
            headerColor: 'FFE2EFD9'
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_N1', 'Annex N-1', 'Sports Development Program',
            ['Program Title', 'Sport Type', 'Date (YYYY-MM-DD)', 'Venue', 'Participants Count', 'Organizer', 'Remarks'],
            $this->fetchAnnexN1Data($heiId, $academicYear), $academicYear
        );
        $this->addTabularSheet($spreadsheet, 'ANNEX_O', 'Annex O', 'Community Involvement/Outreach',
            ['Title of Program', 'Date Conducted (YYYY-MM-DD)', 'No. of Beneficiaries', 'Type of Community Service', 'Community/Population Served'],
            $this->fetchAnnexOData($heiId, $academicYear), $academicYear,
            subRow: [
                1 => '(to include GAD activities)',
                4 => '(e.g. blood letting, tree planting, medical mission, fund-raising events, clean-up drive, livelihood training, etc.)',
                5 => '(e.g. Aetas, flood victims, etc.)',
            ],
            subRowMerges: [],
            headerColor: 'FFE2EFD9'
        );

        return $spreadsheet;
    }

    // ── sheet builders ─────────────────────────────────────────────────────

    private function addInstructionsSheet(Spreadsheet $ss, string $ay): void
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

    /**
     * Generic tabular sheet — handles A, B, C, C-1, E, I, I-1, J, K, L, L-1, N, N-1, O
     *
     * Header structure mirrors the original CHED SASTOOL template:
     *   Row 1: [TAG] — yellow, machine-readable import tag
     *   Row 2: ANNEX "X" — bold, plain black, merged
     *   Row 3: LIST OF PROGRAMS/PROJECTS/ACTIVITIES — bold, merged
     *   Row 4: form sub-title — bold, merged
     *   Row 5: AY line placeholder — bold, merged
     *   Row 6: spacer
     *   Row 7: column headers — light green, bold, size 10
     *   Row 8: optional cosmetic sub-row (example hints, type sub-headers) — same green bg
     *   Row 8 or 9+: data rows (depends on whether $subRow is provided)
     *
     * $subRow: sparse array of 1-based col index → cell text for the sub-row.
     *          Pass [] to skip the sub-row (data starts at row 8).
     * $subRowMerges: array of [startCol, endCol] pairs to merge in the sub-row.
     * $headerColor: ARGB hex — defaults to C5E0B3; Annex N/O use E2EFD9.
     */
    private function addTabularSheet(
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
    ): void {
        $ws = new Worksheet($ss, $tabName);
        $ss->addSheet($ws);

        $lastColIdx = count($headers);
        $lastCol    = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColIdx);

        // ── Page setup (Legal landscape, matching original) ───────────────
        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[' . $tag . ']');
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);

        // ── Rows 2–5: title block (plain bold, centered, no fill) ─────────
        // Mirrors the original CHED SASTOOL layout:
        //   Row 2: ANNEX "X" (annex letter/name)
        //   Row 3: LIST OF PROGRAMS/PROJECTS/ACTIVITIES
        //   Row 4: form subtitle (caps)
        //   Row 5: As of Academic Year (AY) YYYY-YYYY
        // Rows 2 and 5: black (automatic) — ANNEX "X" and AY line
        foreach (['A2', 'A5'] as $cell) {
            $ws->mergeCells($cell[0] . $cell[1] . ':' . $lastCol . $cell[1]);
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        // Rows 3 and 4: dark blue FF2F5496 — LIST OF... and subtitle (matches CHED original)
        foreach (['A3', 'A4'] as $cell) {
            $ws->mergeCells($cell[0] . $cell[1] . ':' . $lastCol . $cell[1]);
            $ws->getStyle($cell)->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        // Format tab name as original: "Annex A" -> 'ANNEX "A"', "Annex C-1" -> 'ANNEX "C-1"'
        $annexLabel = strtoupper(preg_replace('/^Annex\s+/i', 'ANNEX "', $tabName)) . '"';
        $ws->setCellValue('A2', $annexLabel);
        $ws->setCellValue('A3', 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES');
        $ws->setCellValue('A4', strtoupper($title));
        $ws->setCellValue('A5', 'As of Academic Year (AY) ' . $academicYear);

        // ── Row 6: spacer ─────────────────────────────────────────────────
        $ws->getRowDimension(6)->setRowHeight(4);

        // ── Row 7: column headers ────────────────────────────────────────
        foreach ($headers as $i => $header) {
            $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);
            $ws->setCellValue($col . '7', $header);
        }
        $ws->getStyle('A7:' . $lastCol . '7')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $headerColor]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $ws->getRowDimension(7)->setRowHeight(30);

        // ── Row 8: optional cosmetic sub-row ─────────────────────────────
        // Contains example hints or structural sub-headers (e.g. Male/Female/Coed under Type).
        // Parsers skip this row via DATA_ROW_START = 9 when a sub-row is present.
        if (!empty($subRow)) {
            foreach ($subRow as $colIdx => $text) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
                $ws->setCellValue($col . '8', $text);
            }
            foreach ($subRowMerges as [$mergeStart, $mergeEnd]) {
                $startCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($mergeStart);
                $endCol   = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($mergeEnd);
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
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);
                $ws->setCellValue($col . $rowNum, $val ?? '');
                $ws->getStyle($col . $rowNum)->applyFromArray([
                    'font'      => ['name' => 'Arial', 'size' => 10],
                    'alignment' => ['wrapText' => true],
                ]);
            }
            $ws->getRowDimension($rowNum)->setRowHeight(15.75);
            $rowNum++;
        }

        foreach (range(1, $lastColIdx) as $colIdx) {
            $ws->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
        }

        $ws->freezePane('A' . (empty($subRow) ? 8 : 9));
    }

    private function addAnnexDSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws  = new Worksheet($ss, 'Annex D');
        $ss->addSheet($ws);
        $sub = AnnexDSubmission::where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        // ── Page setup ────────────────────────────────────────────────────
        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);

        // ── Column widths (matching original: A≈48, B≈27, C≈58) ──────────
        $ws->getColumnDimension('A')->setWidth(47.9);
        $ws->getColumnDimension('B')->setWidth(27.4);
        $ws->getColumnDimension('C')->setWidth(57.6);

        // ── Row 1: machine-readable tag (import contract — do not move) ───
        $ws->setCellValue('A1', '[ANNEX_D]');
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);

        // ── Rows 2–4: title block (plain bold, centered, no bg — matches original) ─
        foreach (['A2:C2', 'A4:C4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A3:C3'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->mergeCells('A5:C5');
        $ws->setCellValue('A2', 'ANNEX "D"');
        $ws->setCellValue('A3', 'UPDATES ON STUDENT HANDBOOK/MANUAL');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);
        // Row 5 intentionally blank (matches original SASTOOL Annex D layout)

        // ── Data rows 5–36: position-based parser contract ────────────────
        //
        // AnnexDParser reads col 2 (B) by $r++ from row 5. Row order here
        // IS the import contract — do NOT reorder these entries.
        //
        // Each entry: [label text, isSectionHeader bool]
        // Col A: light-blue bg (DEEAF6), matching original template field cells
        // Col B: value — user fills in
        // Col C: empty (mirrors original's wide C column)

        $fields = [
            // row 5  — version_publication_date
            ['Version/ Publication date:', false],
            // row 6  — officer_in_charge
            ['Officer-in-Charge:', false],
            // row 7  — handbook_committee
            ['Composition of the Student Handbook Committee:', false],
            // row 8  — dissemination_orientation
            ['Mode of Dissemination: Orientation (YES/NO)', false],
            // row 9  — orientation_dates
            ['Date/s of Orientation:', false],
            // row 10 — mode_of_delivery
            ['Mode of delivery (F2F/online or both):', false],
            // row 11 — dissemination_uploaded
            ['Dissemination: Uploaded in Website (YES/NO)', false],
            // row 12 — dissemination_others
            ['Dissemination: Others (YES/NO)', false],
            // row 13 — dissemination_others_text
            ['Dissemination: Others — specify:', false],
            // row 14 — type_digital
            ['Type of Student Handbook/Manual: Digital Copy (YES/NO)', false],
            // row 15 — type_printed
            ['Type of Student Handbook/Manual: Printed (YES/NO)', false],
            // row 16 — type_others
            ['Type of Student Handbook/Manual: Others (YES/NO)', false],
            // row 17 — type_others_text
            ['Type of Student Handbook/Manual: Others — specify:', false],
            // row 18 — has_academic_policies (section header, value blank)
            ['Contains the following information (check all applicable):', true],
            // row 19 — has_admission_requirements
            ['Academic and Institutional Policies (YES/NO)', false],
            // row 20 — has_code_of_conduct
            ['Admission Requirements (YES/NO)', false],
            // row 21 — has_scholarships
            ['Student Code of Conduct and Discipline (YES/NO)', false],
            // row 22 — has_student_publication
            ['Scholarships/Financial Assistance (YES/NO)', false],
            // row 23 — has_housing_services
            ['Student Publication (YES/NO)', false],
            // row 24 — has_disability_services
            ['Housing Services/Dormitories, if applicable (YES/NO)', false],
            // row 25 — has_student_council
            ['Services for Learners with Disabilities and Special Needs (YES/NO)', false],
            // row 26 — has_refund_policies
            ['Student Council/Government/Organizations (YES/NO)', false],
            // row 27 — has_drug_education
            ['Refund Policies (YES/NO)', false],
            // row 28 — has_foreign_students
            ['Drug Education, Prevention and Control (YES/NO)', false],
            // row 29 — has_disaster_management
            ['Foreign Students, if applicable (YES/NO)', false],
            // row 30 — has_safe_spaces
            ['Disaster Risk Reduction and Management (YES/NO)', false],
            // row 31 — has_anti_hazing
            ['Safe Spaces Act (YES/NO)', false],
            // row 32 — has_anti_bullying
            ['Anti-Hazing Act (YES/NO)', false],
            // row 33 — has_violence_against_women
            ['Anti-Bullying Act (YES/NO)', false],
            // row 34 — has_gender_fair
            ['Violence Against Women and Their Children (YES/NO)', false],
            // row 35 — has_others
            ['Gender-Fair Education (YES/NO)', false],
            // row 36 — has_others_text
            ['Others, please specify:', false],
        ];

        $values = [
            $sub?->version_publication_date,
            $sub?->officer_in_charge,
            $sub?->handbook_committee,
            $sub ? ($sub->dissemination_orientation ? 'YES' : 'NO') : '',
            $sub?->orientation_dates,
            $sub?->mode_of_delivery,
            $sub ? ($sub->dissemination_uploaded ? 'YES' : 'NO') : '',
            $sub ? ($sub->dissemination_others ? 'YES' : 'NO') : '',
            $sub?->dissemination_others_text,
            $sub ? ($sub->type_digital ? 'YES' : 'NO') : '',
            $sub ? ($sub->type_printed ? 'YES' : 'NO') : '',
            $sub ? ($sub->type_others ? 'YES' : 'NO') : '',
            $sub?->type_others_text,
            '',  // row 18 is a section header label; value col intentionally blank
            $sub ? ($sub->has_academic_policies ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_admission_requirements ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_code_of_conduct ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_scholarships ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_student_publication ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_housing_services ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_disability_services ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_student_council ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_refund_policies ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_drug_education ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_foreign_students ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_disaster_management ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_safe_spaces ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_anti_hazing ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_anti_bullying ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_violence_against_women ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_gender_fair ? 'YES' : 'NO') : '',
            $sub ? ($sub->has_others ? 'YES' : 'NO') : '',
            $sub?->has_others_text,
        ];

        foreach ($fields as $i => [$label, $isSectionHeader]) {
            $row = $i + 5;
            $ws->setCellValue('A' . $row, $label);
            $ws->setCellValue('B' . $row, $values[$i] ?? '');

            $ws->getStyle('A' . $row)->applyFromArray([
                'font'      => ['bold' => $isSectionHeader, 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getStyle('B' . $row)->applyFromArray([
                'font'      => ['size' => 10],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getRowDimension($row)->setRowHeight(15.75);
        }

        $ws->getPageSetup()->setPrintArea('A1:C36');
        $ws->freezePane('B5');
    }

    private function addAnnexFSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws  = new Worksheet($ss, 'Annex F');
        $ss->addSheet($ws);
        $batch = AnnexFBatch::with('activities')->where('hei_id', $heiId)
            ->where('academic_year', $ay)->whereIn('status', ['submitted', 'published', 'request'])->first();

        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);

        // Row 1: tag
        $ws->setCellValue('A1', '[ANNEX_F]');
        $this->styleTagRow($ws, 'A1');

        // Rows 2-5: title block (plain bold, no bg — CHED original)
        $ws->mergeCells('A2:C2'); $ws->getRowDimension(2)->setRowHeight(6);
        foreach (['A3:C3', 'A4:C4', 'A5:C5'] as $range) { $ws->mergeCells($range); }
        foreach (['A3:C3', 'A6:C6'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A4:C4', 'A5:C5'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A3', 'ANNEX "F"');
        $ws->setCellValue('A4', 'LIST OF PROGRAMS/PROJECTS/ACTIVITIES');
        $ws->setCellValue('A5', 'STUDENT DISCIPLINE');
        $ws->setCellValue('A6', 'As of Academic Year (AY) ' . $ay);

        // Row 8: activity table header — light green (CHED original)
        $ws->mergeCells('A7:C7'); $ws->getRowDimension(7)->setRowHeight(4);
        $ws->setCellValue('A8', 'Activity');
        $ws->setCellValue('B8', 'Date (YYYY-MM-DD)');
        $ws->setCellValue('C8', 'Status');
        $ws->getStyle('A8:C8')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $ws->getRowDimension(8)->setRowHeight(22);

        $row = 9;
        foreach ($batch?->activities ?? [] as $act) {
            $ws->setCellValue('A' . $row, $act->activity);
            $ws->setCellValue('B' . $row, $act->date ?? '');
            $ws->setCellValue('C' . $row, $act->status);
            $row++;
        }

        // Key-value fields below activity table
        $row += 1;
        $fieldStyle = [
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $kvFields = [
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

    private function addAnnexGSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws  = new Worksheet($ss, 'Annex G');
        $ss->addSheet($ws);
        $sub = AnnexGSubmission::with(['editorialBoards', 'otherPublications', 'programs'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $ws->setCellValue('A1', '[ANNEX_G]');
        $this->styleTagRow($ws, 'A1');
        foreach (['A2:D2', 'A4:D4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A3:D3'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A2', 'ANNEX "G"');
        $ws->setCellValue('A3', 'IMPLEMENTATION OF REPUBLIC ACT (R.A.) NO. 7079 / CAMPUS JOURNALISM ACT OF 1991');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);
        $ws->getRowDimension(2)->setRowHeight(22);

        $fields = [
            ['Official School Name',         $sub?->official_school_name],
            ['Student Publication Name',      $sub?->student_publication_name],
            ['Publication Fee per Student',   $sub?->publication_fee_per_student],
            ['Frequency: Monthly (YES/NO)',   $sub ? ($sub->frequency_monthly ? 'YES' : 'NO') : ''],
            ['Frequency: Quarterly (YES/NO)', $sub ? ($sub->frequency_quarterly ? 'YES' : 'NO') : ''],
            ['Frequency: Annual (YES/NO)',    $sub ? ($sub->frequency_annual ? 'YES' : 'NO') : ''],
            ['Frequency: Per Semester (YES/NO)', $sub ? ($sub->frequency_per_semester ? 'YES' : 'NO') : ''],
            ['Frequency: Others (YES/NO)',    $sub ? ($sub->frequency_others ? 'YES' : 'NO') : ''],
            ['Frequency: Others — specify',  $sub?->frequency_others_specify],
            ['Type: Newsletter (YES/NO)',     $sub ? ($sub->publication_type_newsletter ? 'YES' : 'NO') : ''],
            ['Type: Gazette (YES/NO)',        $sub ? ($sub->publication_type_gazette ? 'YES' : 'NO') : ''],
            ['Type: Magazine (YES/NO)',       $sub ? ($sub->publication_type_magazine ? 'YES' : 'NO') : ''],
            ['Type: Others (YES/NO)',         $sub ? ($sub->publication_type_others ? 'YES' : 'NO') : ''],
            ['Type: Others — specify',       $sub?->publication_type_others_specify],
            ['Adviser Name',                  $sub?->adviser_name],
            ['Adviser Position/Designation', $sub?->adviser_position_designation],
        ];

        foreach ($fields as $i => $f) {
            $r = $i + 5;
            $ws->setCellValue('A' . $r, $f[0]);
            $ws->setCellValue('B' . $r, $f[1] ?? '');
            $ws->getStyle('A' . $r)->applyFromArray([
                'font' => ['bold' => true, 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getRowDimension($r)->setRowHeight(15.75);
        }

        $nextRow = 5 + count($fields) + 1;

        $hdrStyle = [
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];

        // Editorial Board sub-table
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

        // Other Publications sub-table
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

        // Programs sub-table
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

        foreach (['A', 'B', 'C', 'D'] as $col) {
            $ws->getColumnDimension($col)->setWidth(35);
        }
    }

    private function addAnnexHSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex H');
        $ss->addSheet($ws);
        $batch = AnnexHBatch::with(['admissionServices', 'admissionStatistics'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $ws->setCellValue('A1', '[ANNEX_H]');
        $this->styleTagRow($ws, 'A1');
        foreach (['A2:D2', 'A4:D4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A3:D3'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A2', 'ANNEX "H"');
        $ws->setCellValue('A3', 'LIST OF ADMISSION SERVICES/ REQUIREMENTS');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);
        $ws->getRowDimension(2)->setRowHeight(22);

        $hdrStyle = [
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];

        // Row 5+: service data rows — must start at row 5 to match AnnexHParser::SERVICES_ROW_START = 5.
        // Parser reads col 2 (with), col 3 (supporting_documents), col 4 (remarks) positionally.
        // Col 1 (service_type label) is cosmetic only — parser uses the predefined list, not col 1.
        //
        // Key by service_type with a trim+lower normalisation to absorb any encoding/whitespace
        // differences between what was stored and what PREDEFINED_SERVICES declares.
        $serviceMap = [];
        foreach ($batch?->admissionServices ?? [] as $svc) {
            $key = strtolower(trim((string) $svc->service_type));
            $serviceMap[$key] = $svc;
        }

        foreach (AnnexHAdmissionService::PREDEFINED_SERVICES as $i => $serviceType) {
            $r   = $i + 5; // rows 5–12, matching SERVICES_ROW_START = 5 in AnnexHParser
            $svc = $serviceMap[strtolower(trim($serviceType))] ?? null;
            $ws->setCellValue('A' . $r, $serviceType);
            $ws->setCellValue('B' . $r, $svc !== null ? ($svc->with ? 'YES' : 'NO') : '');
            $ws->setCellValue('C' . $r, $svc?->supporting_documents ?? '');
            $ws->setCellValue('D' . $r, $svc?->remarks ?? '');
            $ws->getStyle('A' . $r)->applyFromArray([
                'font' => ['size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
                'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $ws->getRowDimension($r)->setRowHeight(15.75);
        }

        // Row 13: spacer. Row 14: stats column headers — matching AnnexHParser::STATS_ROW_START = 14.
        $ws->getRowDimension(13)->setRowHeight(4);

        $ws->setCellValue('A14', 'Program/Department');
        $ws->setCellValue('B14', 'No. of Applicants');
        $ws->setCellValue('C14', 'No. Admitted/Enrolled');
        $ws->setCellValue('D14', 'No. Enrolled');
        $ws->getStyle('A14:D14')->applyFromArray($hdrStyle);
        $ws->getRowDimension(14)->setRowHeight(22);

        $row = 15;
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

    private function addAnnexMSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex M');
        $ss->addSheet($ws);
        $batch = AnnexMBatch::with(['statistics', 'services'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        $ws->setCellValue('A1', '[ANNEX_M]');
        $this->styleTagRow($ws, 'A1');
        foreach (['A2:H2', 'A4:H4'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        foreach (['A3:H3'] as $range) {
            $ws->mergeCells($range);
            $ws->getStyle(explode(':', $range)[0])->applyFromArray([
                'font'      => ['bold' => true, 'size' => 12, 'name' => 'Arial', 'color' => ['argb' => self::COLOR_TITLE_BLUE]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }
        $ws->setCellValue('A2', 'ANNEX "M"');
        $ws->setCellValue('A3', 'HEIs\' INITIATIVES AND DATA ON STUDENTS WITH SPECIAL NEEDS AND PERSONS WITH DISABILITIES');
        $ws->setCellValue('A4', 'As of Academic Year (AY) ' . $ay);
        $ws->getRowDimension(2)->setRowHeight(22);

        // Row 5: spacer, Row 6: [STATISTICS] tag, Row 7: column headers, Row 8+: data
        $ws->getRowDimension(5)->setRowHeight(4);
        $ws->setCellValue('A6', '[STATISTICS]');
        $this->styleTagRow($ws, 'A6');

        $years = $this->getLastThreeYears($ay);
        $colIdx = 3;
        foreach ($years as $year) {
            $enrollCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx++);
            $gradCol   = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx++);
            $ws->setCellValue($enrollCol . '7', $year . ' Enrollment');
            $ws->setCellValue($gradCol . '7',   $year . ' Graduates');
        }
        $ws->setCellValue('A7', 'Category');
        $ws->setCellValue('B7', 'Subcategory');
        $lastHeaderCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx - 1);
        $ws->getStyle('A7:' . $lastHeaderCol . '7')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);
        $ws->getRowDimension(7)->setRowHeight(22);

        $row = 8;
        $statistics = $batch?->statistics?->sortBy('display_order') ?? collect();
        if ($statistics->isEmpty()) {
            // Write empty structure — categories with no predefined subcategories (B, D)
            // get one blank placeholder row so they appear in the exported sheet.
            foreach (AnnexMStatistic::STRUCTURE as $group) {
                if (empty($group['subcategories'])) {
                    $ws->setCellValue('A' . $row, $group['category']);
                    $ws->setCellValue('B' . $row, '');
                    $row++;
                } else {
                    foreach ($group['subcategories'] as $sub) {
                        $ws->setCellValue('A' . $row, $group['category']);
                        $ws->setCellValue('B' . $row, $sub);
                        $row++;
                    }
                }
                if ($group['has_subtotal']) {
                    $ws->setCellValue('A' . $row, $group['category']);
                    $ws->setCellValue('B' . $row, 'Sub-Total');
                    $ws->getStyle('A' . $row . ':B' . $row)->getFont()->setBold(true);
                    $row++;
                }
            }
        } else {
            foreach ($statistics as $stat) {
                $ws->setCellValue('A' . $row, $stat->category);
                $ws->setCellValue('B' . $row, $stat->subcategory);
                $c = 3;
                foreach ($years as $year) {
                    $eCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c++);
                    $gCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c++);
                    $ws->setCellValue($eCol . $row, $stat->year_data[$year]['enrollment'] ?? '');
                    $ws->setCellValue($gCol . $row, $stat->year_data[$year]['graduates'] ?? '');
                }
                $row++;
            }
        }

        $row += 2;

        // Services sub-table
        $ws->setCellValue('A' . $row, '[SERVICES]');
        $this->styleTagRow($ws, 'A' . $row);
        $row++;
        $ws->setCellValue('A' . $row, 'Section');
        $ws->setCellValue('B' . $row, 'Category');
        $ws->setCellValue('C' . $row, 'Institutional Services/Programs/Activities');
        $ws->setCellValue('D' . $row, 'No. of Beneficiaries/Participants');
        $ws->setCellValue('E' . $row, 'Remarks');
        $ws->getStyle('A' . $row . ':E' . $row)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);
        $ws->getRowDimension($row)->setRowHeight(22);
        $row++;
        foreach ($batch?->services?->sortBy('display_order') ?? [] as $svc) {
            $ws->setCellValue('A' . $row, $svc->section);
            $ws->setCellValue('B' . $row, $svc->category);
            $ws->setCellValue('C' . $row, $svc->institutional_services_programs_activities);
            $ws->setCellValue('D' . $row, $svc->number_of_beneficiaries_participants);
            $ws->setCellValue('E' . $row, $svc->remarks);
            $row++;
        }

        foreach (['A', 'B', 'C', 'D', 'E'] as $col) {
            $ws->getColumnDimension($col)->setAutoSize(true);
        }
    }

    // ── data fetchers ──────────────────────────────────────────────────────

    private function fetchAnnexAData(int $heiId, string $ay): array
    {
        $batch = AnnexABatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexBData(int $heiId, string $ay): array
    {
        $batch = AnnexBBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexCData(int $heiId, string $ay): array
    {
        $batch = AnnexCBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->participants_online, $p->participants_face_to_face, $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexC1Data(int $heiId, string $ay): array
    {
        $batch = AnnexC1Batch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexEData(int $heiId, string $ay): array
    {
        $batch = AnnexEBatch::with('organizations')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->organizations->map(fn($o) => [
            $o->name_of_accredited, $o->years_of_existence, $o->accredited_since,
            $o->faculty_adviser, $o->president_and_officers, $o->specialization,
            $o->fee_collected, $o->programs_projects_activities,
        ])->toArray() ?? [];
    }

    private function fetchAnnexIData(int $heiId, string $ay): array
    {
        $batch = AnnexIBatch::with('scholarships')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->scholarships->map(fn($s) => [
            $s->scholarship_name, $s->type, $s->category_intended_beneficiaries,
            $s->number_of_beneficiaries, $s->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexI1Data(int $heiId, string $ay): array
    {
        $batch = AnnexI1Batch::with('foodServices')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->foodServices->map(fn($f) => [
            $f->service_name, $f->service_type, $f->operator_name, $f->location,
            $f->number_of_students_served, $f->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexJData(int $heiId, string $ay): array
    {
        $batch = AnnexJBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title_of_program, $p->organizer,
            $p->participants_online, $p->participants_face_to_face, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexKData(int $heiId, string $ay): array
    {
        $batch = AnnexKBatch::with('committees')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->committees->map(fn($c) => [
            $c->committee_name, $c->committee_head_name, $c->members_composition,
            $c->programs_projects_activities_trainings, $c->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexLData(int $heiId, string $ay): array
    {
        $batch = AnnexLBatch::with('housing')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->housing->map(fn($h) => [
            $h->housing_name, $h->complete_address, $h->house_manager_name,
            $h->male ? 'YES' : 'NO', $h->female ? 'YES' : 'NO', $h->coed ? 'YES' : 'NO',
            $h->others, $h->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexL1Data(int $heiId, string $ay): array
    {
        $batch = AnnexL1Batch::with('internationalServices')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->internationalServices->map(fn($s) => [
            $s->service_name, $s->service_type, $s->target_nationality,
            $s->number_of_students_served, $s->officer_in_charge, $s->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexNData(int $heiId, string $ay): array
    {
        $batch = AnnexNBatch::with('activities')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->activities->map(fn($a) => [
            $a->title_of_activity, $a->implementation_date?->format('Y-m-d') ?? '',
            $a->implementation_venue, $a->participants_online, $a->participants_face_to_face,
            $a->organizer, $a->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexN1Data(int $heiId, string $ay): array
    {
        $batch = AnnexN1Batch::with('sportsPrograms')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->sportsPrograms->map(fn($p) => [
            $p->program_title, $p->sport_type, $p->implementation_date ?? '',
            $p->venue, $p->participants_count, $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexOData(int $heiId, string $ay): array
    {
        $batch = AnnexOBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title_of_program, $p->date_conducted?->format('Y-m-d') ?? '',
            $p->number_of_beneficiaries, $p->type_of_community_service,
            $p->community_population_served,
        ])->toArray() ?? [];
    }

    // ── style helpers ──────────────────────────────────────────────────────

    private function styleTagRow(Worksheet $ws, string $cell): void
    {
        $ws->getStyle($cell)->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);
    }

    private function styleTitleRow(Worksheet $ws, string $from, string $to): void
    {
        $row = (int) filter_var($from, FILTER_SANITIZE_NUMBER_INT);
        $ws->mergeCells($from . ':' . $to);
        $ws->getStyle($from)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $ws->getRowDimension($row)->setRowHeight(22);
    }

    private function getLastThreeYears(string $currentAy): array
    {
        $startYear = (int) substr($currentAy, 0, 4);
        $years     = [];
        for ($i = 2; $i >= 0; $i--) {
            $y       = $startYear - $i;
            $years[] = $y . '-' . ($y + 1);
        }
        return $years;
    }
}
