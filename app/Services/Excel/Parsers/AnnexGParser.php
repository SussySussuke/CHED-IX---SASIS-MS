<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex G — Student Publication
 *
 * Layout:
 *   Row 5:  official_school_name
 *   Row 6:  student_publication_name
 *   Row 7:  publication_fee_per_student
 *   Row 8:  frequency checkboxes (YES/NO each): monthly | quarterly | annual | per_semester | others
 *   Row 9:  frequency_others_specify
 *   Row 10: publication type: newsletter | gazette | magazine | others
 *   Row 11: publication_type_others_specify
 *   Row 12: adviser_name
 *   Row 13: adviser_position_designation
 *
 *   Editorial Board table starts at row 15:
 *     Col 1: name | Col 2: position | Col 3: degree_program_year_level
 *
 *   Other Publications table starts at row 15 (separate sheet section marker at row X)
 *   — for simplicity: editorial board rows until blank row, then other_publications
 *
 *   Programs table: title | implementation_date | venue | target_group
 *
 * NOTE: We use clearly labeled sub-sections in the template.
 * Sub-section marker cells: "[EDITORIAL_BOARD]", "[OTHER_PUBLICATIONS]", "[PROGRAMS]"
 */
class AnnexGParser extends BaseParser
{
    public function sheetId(): string { return 'ANNEX_G'; }
    public function label(): string   { return 'Annex G - Student Publication'; }

    public function parse(Worksheet $ws): ParseResult
    {
        // ── Explicit row/col reads matching the new export layout ───────────────
        //
        // Row 7: A7 = "Name of Official School/ ...: <value>"  B7 = "Publication Fee per student: <value>"
        // Row 8: A8 = "Name of Student Publication: <value>"
        // Row 9: section header labels only (no values)
        // Rows 10–14: col A = circulation checkboxes (☑/☐ prefix)
        // Rows 10–13: col B = type checkboxes (☑/☐ prefix)
        // Row 17: B17 = adviser_name
        // Row 18: B18 = adviser_position_designation

        // Strip label prefix from inline label+value cells (e.g. "Name of School: Foo" → "Foo")
        $stripPrefix = function (string $raw, string $prefix): ?string {
            $raw = trim($raw);
            if (str_starts_with($raw, $prefix)) {
                $val = trim(substr($raw, strlen($prefix)));
                return $val !== '' ? $val : null;
            }
            // Fallback: return whatever is after the first colon
            $pos = strpos($raw, ':');
            if ($pos !== false) {
                $val = trim(substr($raw, $pos + 1));
                return $val !== '' ? $val : null;
            }
            return $raw !== '' ? $raw : null;
        };

        // Row 7: school name (col A merged A:B) and fee (col C merged C:D)
        // Parser reads col 1 (school) and col 3 (fee) — strip label prefix from both.
        $raw_school = (string) $this->cell($ws, 7, 1);
        $raw_fee    = (string) $this->cell($ws, 7, 3);
        $official_school_name        = $stripPrefix($raw_school, 'Name of Official School/ Institutional Student Publication:');
        $fee_raw                     = $stripPrefix($raw_fee, 'Publication Fee per student:');
        $publication_fee_per_student = is_numeric($fee_raw) ? round((float) $fee_raw, 2) : null;

        // Row 8: student publication name (col A, merged A:D)
        $raw_pub_name             = (string) $this->cell($ws, 8, 1);
        $student_publication_name = $stripPrefix($raw_pub_name, 'Name of Student Publication:');

        // Rows 10–14: circulation period — label in col A, dropdown in col B
        // Parser reads bool_(ws, r, 2) instead of checkbox_(ws, r, 1)
        $frequency_monthly      = $this->bool_($ws, 10, 2);
        $frequency_quarterly    = $this->bool_($ws, 11, 2);
        $frequency_annual       = $this->bool_($ws, 12, 2);
        $frequency_per_semester = $this->bool_($ws, 13, 2);
        $frequency_others       = $this->bool_($ws, 14, 2);
        // Others specify is embedded after 'specify:' in col A row 14 label
        $raw_freq_others = (string) $this->cell($ws, 14, 1);
        $freq_specify_pos = stripos($raw_freq_others, 'specify:');
        $frequency_others_specify = null;
        if ($freq_specify_pos !== false) {
            $after = trim(substr($raw_freq_others, $freq_specify_pos + 8));
            if ($after !== '') $frequency_others_specify = $after;
        }

        // Rows 10–13: type of publication — label in col C, dropdown in col D
        // Parser reads bool_(ws, r, 4) instead of checkbox_(ws, r, 2)
        $publication_type_newsletter = $this->bool_($ws, 10, 4);
        $publication_type_gazette    = $this->bool_($ws, 11, 4);
        $publication_type_magazine   = $this->bool_($ws, 12, 4);
        $publication_type_others     = $this->bool_($ws, 13, 4);
        // Others specify embedded after 'specify:' in col C row 13 label
        $raw_type_others = (string) $this->cell($ws, 13, 3);
        $type_specify_pos = stripos($raw_type_others, 'specify:');
        $publication_type_others_specify = null;
        if ($type_specify_pos !== false) {
            $after = trim(substr($raw_type_others, $type_specify_pos + 8));
            if ($after !== '') $publication_type_others_specify = $after;
        }

        // Rows 17–18: adviser fields (col B — unchanged)
        $adviser_name               = $this->str($ws, 17, 2);
        $adviser_position_designation = $this->str($ws, 18, 2);

        $r = 19; // sub-table scanner starts after adviser rows

        // Now scan the rest of the sheet for sub-section markers
        $editorialBoards    = [];
        $otherPublications  = [];
        $programs           = [];
        $errors             = [];
        $currentSection     = null;
        $maxRow             = $ws->getHighestDataRow();

        for (; $r <= $maxRow; $r++) {
            $marker = strtoupper(trim((string) $this->cell($ws, $r, 1)));

            if ($marker === '[EDITORIAL_BOARD]') {
                $currentSection = 'editorial';
                continue;
            }
            if ($marker === '[OTHER_PUBLICATIONS]') {
                $currentSection = 'other_publications';
                continue;
            }
            if ($marker === '[PROGRAMS]') {
                $currentSection = 'programs';
                continue;
            }

            // Skip header rows (contain non-data labels)
            if (str_starts_with($marker, '[') || $marker === 'NAME' || $marker === 'TITLE OF PROGRAM') {
                continue;
            }

            if ($currentSection === 'editorial') {
                if ($this->isRowBlank($ws, $r, 1, 3)) continue;
                $name     = $this->str($ws, $r, 1);
                $position = $this->str($ws, $r, 2);
                $degree   = $this->str($ws, $r, 3);

                if (!$name)     $errors[] = ['row' => $r, 'field' => 'name', 'message' => 'Editorial board member name is required.'];
                if (!$position) $errors[] = ['row' => $r, 'field' => 'position_in_editorial_board', 'message' => 'Position is required.'];
                if (!$degree)   $errors[] = ['row' => $r, 'field' => 'degree_program_year_level',   'message' => 'Degree/year level is required.'];

                $editorialBoards[] = [
                    'name'                      => $name ?? '',
                    'position_in_editorial_board' => $position ?? '',
                    'degree_program_year_level' => $degree ?? '',
                ];
            }

            if ($currentSection === 'other_publications') {
                if ($this->isRowBlank($ws, $r, 1, 3)) continue;
                $pubName   = $this->str($ws, $r, 1);
                $dept      = $this->str($ws, $r, 2);
                $pubType   = $this->str($ws, $r, 3);

                if (!$pubName) $errors[] = ['row' => $r, 'field' => 'name_of_publication', 'message' => 'Publication name is required.'];
                if (!$dept)    $errors[] = ['row' => $r, 'field' => 'department_unit_in_charge', 'message' => 'Department is required.'];
                if (!$pubType) $errors[] = ['row' => $r, 'field' => 'type_of_publication', 'message' => 'Publication type is required.'];

                $otherPublications[] = [
                    'name_of_publication'       => $pubName ?? '',
                    'department_unit_in_charge' => $dept ?? '',
                    'type_of_publication'       => $pubType ?? '',
                ];
            }

            if ($currentSection === 'programs') {
                if ($this->isRowBlank($ws, $r, 1, 4)) continue;
                $progTitle = $this->str($ws, $r, 1);
                $progDate  = $this->date_($ws, $r, 2);
                $progVenue = $this->str($ws, $r, 3);
                $progGroup = $this->str($ws, $r, 4);

                if (!$progTitle) $errors[] = ['row' => $r, 'field' => 'title_of_program', 'message' => 'Program title is required.'];
                if (!$progDate)  $errors[] = ['row' => $r, 'field' => 'implementation_date', 'message' => 'Invalid or missing date.'];
                if (!$progVenue) $errors[] = ['row' => $r, 'field' => 'implementation_venue', 'message' => 'Venue is required.'];
                if (!$progGroup) $errors[] = ['row' => $r, 'field' => 'target_group_of_participants', 'message' => 'Target group is required.'];

                $programs[] = [
                    'title_of_program'              => $progTitle ?? '',
                    'implementation_date'           => $progDate ?? '',
                    'implementation_venue'          => $progVenue ?? '',
                    'target_group_of_participants'  => $progGroup ?? '',
                ];
            }
        }

        $anyData = $official_school_name || $student_publication_name
            || count($editorialBoards) > 0 || count($programs) > 0;

        $payload = [
            'form_data' => compact(
                'official_school_name', 'student_publication_name', 'publication_fee_per_student',
                'frequency_monthly', 'frequency_quarterly', 'frequency_annual',
                'frequency_per_semester', 'frequency_others', 'frequency_others_specify',
                'publication_type_newsletter', 'publication_type_gazette',
                'publication_type_magazine', 'publication_type_others',
                'publication_type_others_specify', 'adviser_name', 'adviser_position_designation'
            ),
            'editorial_boards'   => $editorialBoards,
            'other_publications' => $otherPublications,
            'programs'           => $programs,
        ];

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: $payload,
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
