<?php

namespace App\Services\Excel\Parsers;

use App\Models\AnnexMStatistic;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex M — Students with Special Needs / PWD
 *
 * Layout has two sub-sections, each marked with a tag cell:
 *
 * [STATISTICS] sub-table (fixed structure from AnnexMStatistic::STRUCTURE):
 *   Col 1: category | Col 2: subcategory
 *   Col 3..N: enrollment per AY, Col N+1..M: graduates per AY
 *   The academic years are listed in the header row — we read them dynamically.
 *   Row after [STATISTICS] is the header row.
 *
 * [SERVICES] sub-table:
 *   Col 1: section | Col 2: category | Col 3: institutional_services_programs_activities
 *   Col 4: number_of_beneficiaries_participants | Col 5: remarks | Col 6: display_order
 */
class AnnexMParser extends BaseParser
{
    public function sheetId(): string { return 'ANNEX_M'; }
    public function label(): string   { return 'Annex M - Students with Special Needs/PWD'; }

    public function parse(Worksheet $ws): ParseResult
    {
        $statistics   = [];
        $services     = [];
        $errors       = [];
        $anyData      = false;
        $maxRow       = $ws->getHighestDataRow();
        $currentSection = null;
        $headerRow      = null;
        $yearColumns    = []; // maps col index => ['year' => AY string, 'type' => 'enrollment'|'graduates']
        $displayOrder   = 0;

        for ($r = 5; $r <= $maxRow; $r++) {
            $marker = strtoupper(trim((string) $this->cell($ws, $r, 1)));

            if ($marker === '[STATISTICS]') {
                $currentSection = 'statistics';
                $headerRow      = $r + 1;
                // Parse header row to detect year columns
                $yearColumns = $this->parseStatisticsHeader($ws, $headerRow);
                $r = $headerRow; // skip header row in main loop
                continue;
            }

            if ($marker === '[SERVICES]') {
                $currentSection = 'services';
                $r++; // skip the services header row
                continue;
            }

            if ($r === $headerRow) continue;

            if ($currentSection === 'statistics') {
                if ($this->isRowBlank($ws, $r, 1, max(3, count($yearColumns) + 2))) continue;

                $anyData    = true;
                $category    = $this->str($ws, $r, 1);
                $subcategory = $this->str($ws, $r, 2);

                // Skip placeholder rows — exported when a category has no predefined
                // subcategories (e.g. B, D). They have a category but blank subcategory
                // and no numeric data, so they carry no information.
                if (!$subcategory) {
                    $hasAnyNumeric = false;
                    foreach ($yearColumns as $col => $meta) {
                        if ($this->int_($ws, $r, $col) !== 0) { $hasAnyNumeric = true; break; }
                    }
                    if (!$hasAnyNumeric) continue;
                }

                // Sub-Total is written in col 2 (subcategory), not col 1 (category).
                $isSubtotal = strtolower(trim((string) ($subcategory ?? ''))) === 'sub-total';

                $yearData = [];
                foreach ($yearColumns as $col => $meta) {
                    $val = $this->int_($ws, $r, $col);
                    $yearData[$meta['year']][$meta['type']] = $val;
                }

                $statistics[] = [
                    'category'      => $category ?? '',
                    'subcategory'   => $subcategory,
                    'year_data'     => $yearData,
                    'is_subtotal'   => $isSubtotal,
                    'display_order' => $displayOrder++,
                ];
            }

            if ($currentSection === 'services') {
                if ($this->isRowBlank($ws, $r, 1, 5)) continue;

                $anyData  = true;
                $section  = $this->str($ws, $r, 1);
                $category = $this->str($ws, $r, 2);
                $services_desc = $this->longStr($ws, $r, 3);
                $count    = $this->int_($ws, $r, 4);
                $remarks  = $this->str($ws, $r, 5);

                $validSections = AnnexMStatistic::STRUCTURE;
                $sectionNames  = array_column($validSections, 'category');

                if ($section && !in_array($section, $sectionNames, true)) {
                    $errors[] = ['row' => $r, 'field' => 'section', 'message' => "Invalid section: '{$section}'. Must be one of the predefined categories."];
                }
                if (!$services_desc) {
                    $errors[] = ['row' => $r, 'field' => 'institutional_services_programs_activities', 'message' => 'Service/program description is required.'];
                }

                $services[] = [
                    'section'                                  => $section ?? '',
                    'category'                                 => $category,
                    'institutional_services_programs_activities' => $services_desc ?? '',
                    'number_of_beneficiaries_participants'     => $count,
                    'remarks'                                  => $remarks,
                    'display_order'                            => $displayOrder++,
                ];
            }
        }

        // If statistics is empty but the structure expects it, build skeleton
        if (empty($statistics)) {
            $statistics = $this->buildEmptyStatisticsStructure();
        }

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: ['statistics' => $statistics, 'services' => $services],
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }

    private function parseStatisticsHeader(Worksheet $ws, int $headerRow): array
    {
        // Format: Col1=Category, Col2=Subcategory, then pairs of enrollment/graduates per AY
        // Header cells will be like "AY 2024-2025 Enrollment" and "AY 2024-2025 Graduates"
        $yearColumns = [];
        $maxCol = $ws->getHighestDataColumn();
        $maxColIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($maxCol);

        for ($c = 3; $c <= $maxColIndex; $c++) {
            $header = trim((string) $this->cell($ws, $headerRow, $c));
            if (preg_match('/(\d{4}-\d{4})\s+(Enrollment|Graduates)/i', $header, $m)) {
                $yearColumns[$c] = [
                    'year' => $m[1],
                    'type' => strtolower($m[2]),
                ];
            }
        }

        return $yearColumns;
    }

    private function buildEmptyStatisticsStructure(): array
    {
        $rows  = [];
        $order = 0;
        foreach (AnnexMStatistic::STRUCTURE as $group) {
            foreach ($group['subcategories'] as $sub) {
                $rows[] = [
                    'category'      => $group['category'],
                    'subcategory'   => $sub,
                    'year_data'     => [],
                    'is_subtotal'   => false,
                    'display_order' => $order++,
                ];
            }
            if ($group['has_subtotal']) {
                $rows[] = [
                    'category'      => $group['category'],
                    'subcategory'   => 'Sub-Total',
                    'year_data'     => [],
                    'is_subtotal'   => true,
                    'display_order' => $order++,
                ];
            }
        }
        return $rows;
    }
}
