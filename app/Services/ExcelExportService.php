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
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
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
            ],
            yesNoCols: [4, 5, 6],  // Male / Female / Coed — dropdown applied per data row
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
        array $yesNoCols = [],  // 1-based column indexes that should get a YES/NO dropdown
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
                $colIdx = $i + 1;
                $col    = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
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

        // ── Column widths matching original template ───────────────────────
        $ws->getColumnDimension('A')->setWidth(47.9);
        $ws->getColumnDimension('B')->setWidth(27.4);
        $ws->getColumnDimension('C')->setWidth(57.6);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_D]');
        $ws->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_TAG_BG]],
        ]);

        // ── Rows 2–4: title block (mirrors original exactly) ──────────────
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

        // ── New column layout (label | dropdown | text-overflow) ──────────
        // Col A = label text (merged A:B for checkbox rows, full A:C for text fields)
        // Col B = YES/NO dropdown for all checkbox fields  (parser reads bool_() col 2)
        // Col C = free-text / overflow (orientation dates, delivery mode, others text)
        //
        // Column widths: A=55 (label), B=12 (dropdown), C=65 (text/overflow)
        $ws->getColumnDimension('A')->setWidth(55);
        $ws->getColumnDimension('B')->setWidth(12);
        $ws->getColumnDimension('C')->setWidth(65);

        $fieldStyle = [
            'font'      => ['size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $boldFieldStyle = array_merge_recursive($fieldStyle, ['font' => ['bold' => true]]);
        $valueStyle = [
            'font'      => ['size' => 10, 'name' => 'Arial'],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $yn = fn(?bool $v): string => $v ? 'YES' : 'NO';

        // ── Rows 5–10: text fields (unchanged — label+value merged A:C) ───
        // AnnexDParser reads these via str() + stripPrefix, col 1. No change needed.
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

        // ── Rows 13–18: dissemination (col A label, col B dropdown) ──────
        // and type (col C label, col B dropdown — but type only has rows 13–14)
        //
        // New layout per row:
        //   Col A (label, merged A only for checkbox rows)
        //   Col B = YES/NO dropdown — parser reads bool_(ws, r, 2)
        //   Col C = type label / text value
        //
        // Dissemination checkboxes: rows 13, 17, 18 → col B dropdown
        // Dissemination text rows: 14 (orientation dates), 15+16 (delivery mode) → merged A:B, value in C
        // Type checkboxes: rows 13, 14 → col C label + col B is SHARED with dissem
        //   — we can't put two dropdowns in col B for the same row.
        //   Solution: type gets its own dropdown column D (narrow, hidden-ish)
        //   Parser reads: dissem_checkbox = bool_(ws,r,2)  type_checkbox = bool_(ws,r,4)

        // Add col D for type dropdowns
        $ws->getColumnDimension('D')->setWidth(10);

        // Row 13: Orientation (A) | dissem dropdown (B) | Digital Copy label (C) | type dropdown (D)
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

        // Row 14: Date/s of Orientation label (A) | value (B merged to C — text) | Printed label (C→ already used) | type dropdown (D)
        // Compromise: orientation date label in A, value in B (the dropdown col is vacated for text rows)
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

        // Row 15: Mode of delivery label (A) | type_others label (C) | type_others dropdown (D)
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

        // Row 16: type_others_text value in C
        $ws->setCellValue('C16', $sub?->type_others_text ?? '');
        $ws->getStyle('C16')->applyFromArray($valueStyle);
        $ws->getRowDimension(16)->setRowHeight(15.75);

        // Row 17: Uploaded in Website (A) | dropdown (B)
        $ws->setCellValue('A17', 'Uploaded in Website');
        $ws->setCellValue('B17', $yn($sub?->dissemination_uploaded));
        $this->applyYesNoDropdown($ws, 'B17');
        $ws->getStyle('A17')->applyFromArray($fieldStyle);
        $ws->getStyle('B17')->applyFromArray($valueStyle);
        $ws->getRowDimension(17)->setRowHeight(15.75);

        // Row 18: Others, please specify (A) | dropdown (B) | specify text (C)
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

        // ── Rows 21–38: label (A:C merged) | YES/NO dropdown (D) ──────────
        // Parser reads: bool_(ws, r, 4) — col D, NOT checkbox_() anymore.
        // Row 39 = free-text for has_others_text (no dropdown, merged A:D).
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

        // ── Page setup ────────────────────────────────────────────────────
        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);

        // ── Column widths matching the original ───────────────────────────
        $ws->getColumnDimension('A')->setWidth(40);
        $ws->getColumnDimension('B')->setWidth(40);
        $ws->getColumnDimension('C')->setWidth(35);
        $ws->getColumnDimension('D')->setWidth(35);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_G]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2–5: title block matching original exactly ─────────────────
        // Original: Row 1=ANNEX G, Row 2=blank, Row 3=RA 7079 title,
        //           Row 4=CAMPUS JOURNALISM..., Row 5=AY
        // We shift by 1 because row 1 is our tag.
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
        $ws->getRowDimension(6)->setRowHeight(4); // spacer

        $fieldStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_FIELD_BG]],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $valueStyle = [
            'font'      => ['size' => 10, 'name' => 'Arial'],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $yn = fn(?bool $v): string => $v ? 'YES' : 'NO';

        // ── New column layout for Annex G ─────────────────────────────────
        // Col A = Circulation Period label  Col B = freq YES/NO dropdown
        // Col C = Type of Publication label Col D = type YES/NO dropdown
        // Parser reads: frequency = bool_(ws, r, 2)  publication_type = bool_(ws, r, 4)
        $ws->getColumnDimension('A')->setWidth(35);
        $ws->getColumnDimension('B')->setWidth(10);
        $ws->getColumnDimension('C')->setWidth(35);
        $ws->getColumnDimension('D')->setWidth(10);

        // ── Row 7: Name of School (A) | Publication Fee (C) ──────────────
        // Parser reads: official_school_name = str(ws, 7, 1) strips prefix
        //               publication_fee_per_student = str(ws, 7, 3) strips prefix
        $ws->mergeCells('A7:B7');
        $ws->setCellValue('A7', 'Name of Official School/ Institutional Student Publication: ' . ($sub?->official_school_name ?? ''));
        $ws->mergeCells('C7:D7');
        $ws->setCellValue('C7', 'Publication Fee per student: ' . ($sub?->publication_fee_per_student ?? ''));
        $ws->getStyle('A7')->applyFromArray($fieldStyle);
        $ws->getStyle('C7')->applyFromArray($fieldStyle);
        $ws->getRowDimension(7)->setRowHeight(15.75);

        // ── Row 8: Student Publication Name (A:D merged) ──────────────────
        // Parser reads: student_publication_name = str(ws, 8, 1) strips prefix.
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
        // Parser reads: frequency_* = bool_(ws, r, 2)  publication_type_* = bool_(ws, r, 4)
        // frequency_others_specify = str(ws, 14, 1) via stripPrefix after 'specify'
        // publication_type_others_specify = str(ws, 13, 3) via stripPrefix after 'specify'
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

        // ── Rows 15–18: spacer + Table 1 header + Adviser fields ─────────────
        // Matches original rows 18–20 layout.
        $ws->getRowDimension(15)->setRowHeight(4);
        $ws->mergeCells('A16:D16');
        $ws->setCellValue('A16', 'Table 1. Composition of Editorial Board of the University-Wide publication');
        $ws->getStyle('A16')->applyFromArray($fieldStyle);
        $ws->getRowDimension(16)->setRowHeight(15.75);

        // Adviser — parser reads: adviser_name = str(ws, 17, 2)
        //                          adviser_position_designation = str(ws, 18, 2)
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

        $nextRow = 20;

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

        // Row 5: column headers for the admission services table.
        $ws->setCellValue('A5', 'Service Type');
        $ws->setCellValue('B5', 'Check (YES/NO)');
        $ws->setCellValue('C5', 'Supporting Documents');
        $ws->setCellValue('D5', 'Remarks');
        $ws->getStyle('A5:D5')->applyFromArray($hdrStyle);
        $ws->getRowDimension(5)->setRowHeight(22);

        // Row 6+: service data rows — must start at row 6 to match AnnexHParser::SERVICES_ROW_START = 6.
        // Parser reads col 2 (with), col 3 (supporting_documents), col 4 (remarks) positionally.
        // Col 1 (service_type label) is cosmetic only — parser uses the predefined list, not col 1.
        //
        // Col B gets a YES/NO dropdown via Data Validation — parser's bool_() handles YES/NO on import.
        // Key by service_type with a trim+lower normalisation to absorb any encoding/whitespace
        // differences between what was stored and what PREDEFINED_SERVICES declares.
        $serviceMap = [];
        foreach ($batch?->admissionServices ?? [] as $svc) {
            $key = strtolower(trim((string) $svc->service_type));
            $serviceMap[$key] = $svc;
        }

        foreach (AnnexHAdmissionService::PREDEFINED_SERVICES as $i => $serviceType) {
            $r   = $i + 6; // rows 6–13, matching SERVICES_ROW_START = 6 in AnnexHParser
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

        // Row 11: spacer. Row 12: stats column headers. Row 13+: stats data.
        // Matching AnnexHParser::STATS_ROW_START = 13.
        $ws->getRowDimension(11)->setRowHeight(4);

        $ws->setCellValue('A12', 'Program/Department');
        $ws->setCellValue('B12', 'No. of Applicants');
        $ws->setCellValue('C12', 'No. Admitted');
        $ws->setCellValue('D12', 'No. Enrolled');
        $ws->getStyle('A12:D12')->applyFromArray($hdrStyle);
        $ws->getRowDimension(12)->setRowHeight(22);

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

    private function addAnnexMSheet(Spreadsheet $ss, int $heiId, string $ay): void
    {
        $ws    = new Worksheet($ss, 'Annex M');
        $ss->addSheet($ws);
        $batch = AnnexMBatch::with(['statistics', 'services'])
            ->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();

        // ── Page setup ────────────────────────────────────────────────────
        $ws->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_LEGAL)
            ->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.7)->setRight(0.7);

        // ── Row 1: machine-readable tag ───────────────────────────────────
        $ws->setCellValue('A1', '[ANNEX_M]');
        $this->styleTagRow($ws, 'A1');

        // ── Rows 2–5: title block matching original CHED SASTOOL ──────────
        // Row 2: ANNEX "M" — black bold centered
        // Row 3: subtitle line 1 — blue bold centered
        // Row 4: subtitle line 2 — blue bold centered
        // Row 5: AY line — black bold centered
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

        // ── Row 6: spacer ─────────────────────────────────────────────────
        $ws->getRowDimension(6)->setRowHeight(4);

        // ── Row 7: Table 1 label ──────────────────────────────────────────
        $ws->mergeCells('A7:G7');
        $ws->setCellValue('A7', 'Table 1. Basic Statistics');
        $ws->getStyle('A7')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
        ]);

        // ── Row 8: [STATISTICS] machine-readable tag ──────────────────────
        $ws->setCellValue('A8', '[STATISTICS]');
        $this->styleTagRow($ws, 'A8');

        // ── Row 9: column headers ─────────────────────────────────────────
        $hdrStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => self::COLOR_COL_HDR_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
        $ws->setCellValue('A9', 'Category (based on the DOH Categories)');
        $ws->setCellValue('B9', 'Subcategory');
        $ws->setCellValue('C9', $ay . ' Enrollment');
        $ws->setCellValue('D9', $ay . ' Graduates');
        $ws->getStyle('A9:D9')->applyFromArray($hdrStyle);
        $ws->getRowDimension(9)->setRowHeight(30);

        // ── Statistics data rows ──────────────────────────────────────────
        // Category header rows (e.g. "A. Persons with Disabilities"): light blue DEEAF6, bold, merged across all cols.
        // Sub-Total rows: light green E2EFD9, bold.
        // Regular subcategory rows: no fill.
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

        $row         = 10;
        $statistics  = $batch?->statistics?->sortBy('display_order') ?? collect();
        $prevCategory = null;

        $writeStatRow = function (string $category, ?string $subcategory, int $enrollment, int $graduates)
            use ($ws, &$row, &$prevCategory, $categoryStyle, $subtotalStyle, $dataRowStyle): void
        {
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
        $ws->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
        ]);
        $row++;

        // ── [SERVICES] machine-readable tag + column headers ──────────────
        $ws->setCellValue('A' . $row, '[SERVICES]');
        $this->styleTagRow($ws, 'A' . $row);
        $row++;

        // Services table uses E2EFD9 (lighter green) to match the original CHED template's Table 2 header.
        $svcHdrStyle = [
            'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE2EFD9']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ];
        // 5-col layout matches AnnexMParser: col1=section, col2=category, col3=program, col4=count, col5=remarks.
        $ws->setCellValue('A' . $row, 'Category');
        $ws->setCellValue('B' . $row, 'Sub-category');
        $ws->setCellValue('C' . $row, 'Institutional Services offered/ Programs Implemented/ Activities conducted/ and others');
        $ws->setCellValue('D' . $row, 'No. of Beneficiaries/ Participants');
        $ws->setCellValue('E' . $row, 'Remarks, if any');
        $ws->getStyle('A' . $row . ':E' . $row)->applyFromArray($svcHdrStyle);
        $ws->getRowDimension($row)->setRowHeight(27);
        $row++;

        foreach ($batch?->services?->sortBy('display_order') ?? [] as $svc) {
            $ws->setCellValue('A' . $row, $svc->section);
            $ws->setCellValue('B' . $row, $svc->category);
            $ws->setCellValue('C' . $row, $svc->institutional_services_programs_activities);
            $ws->setCellValue('D' . $row, $svc->number_of_beneficiaries_participants);
            $ws->setCellValue('E' . $row, $svc->remarks);
            $ws->getStyle('A' . $row . ':E' . $row)->applyFromArray($dataRowStyle);
            $ws->getRowDimension($row)->setRowHeight(15.75);
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
            $h->male   ? 'YES' : 'NO',
            $h->female ? 'YES' : 'NO',
            $h->coed   ? 'YES' : 'NO',
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

    /**
     * Apply a YES/NO dropdown (Data Validation list) to a single cell.
     * Parser's bool_() already handles YES/NO strings — import side needs no changes.
     *
     * NOTE: setShowDropDown(false) is NOT a typo — PhpSpreadsheet's flag is inverted:
     * false = show the dropdown arrow in Excel, true = hide it.
     */
    private function applyYesNoDropdown(Worksheet $ws, string $cell): void
    {
        $validation = $ws->getCell($cell)->getDataValidation();
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowDropDown(false)   // false = SHOW the arrow (PhpSpreadsheet API is inverted)
            ->setShowErrorMessage(true)
            ->setErrorTitle('Invalid input')
            ->setError('Please select YES or NO from the dropdown.')
            ->setFormula1('"YES,NO"');
    }

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
