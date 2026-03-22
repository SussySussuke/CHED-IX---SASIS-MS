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
        $r = 5;

        $official_school_name          = $this->str($ws, $r++, 2);
        $student_publication_name      = $this->str($ws, $r++, 2);
        $publication_fee_per_student   = $this->cell($ws, $r++, 2);
        $publication_fee_per_student   = is_numeric($publication_fee_per_student)
                                            ? round((float) $publication_fee_per_student, 2)
                                            : null;

        // Frequency — one row per checkbox
        $frequency_monthly     = $this->bool_($ws, $r++, 2);
        $frequency_quarterly   = $this->bool_($ws, $r++, 2);
        $frequency_annual      = $this->bool_($ws, $r++, 2);
        $frequency_per_semester = $this->bool_($ws, $r++, 2);
        $frequency_others      = $this->bool_($ws, $r++, 2);
        $frequency_others_specify = $this->str($ws, $r++, 2);

        // Publication type
        $publication_type_newsletter = $this->bool_($ws, $r++, 2);
        $publication_type_gazette    = $this->bool_($ws, $r++, 2);
        $publication_type_magazine   = $this->bool_($ws, $r++, 2);
        $publication_type_others     = $this->bool_($ws, $r++, 2);
        $publication_type_others_specify = $this->str($ws, $r++, 2);

        $adviser_name               = $this->str($ws, $r++, 2);
        $adviser_position_designation = $this->str($ws, $r++, 2);

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

        $payload = compact(
            'official_school_name', 'student_publication_name', 'publication_fee_per_student',
            'frequency_monthly', 'frequency_quarterly', 'frequency_annual',
            'frequency_per_semester', 'frequency_others', 'frequency_others_specify',
            'publication_type_newsletter', 'publication_type_gazette',
            'publication_type_magazine', 'publication_type_others',
            'publication_type_others_specify', 'adviser_name', 'adviser_position_designation'
        );
        $payload['editorial_boards']   = $editorialBoards;
        $payload['other_publications'] = $otherPublications;
        $payload['programs']           = $programs;

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: $payload,
            errors:  $errors,
            isEmpty: !$anyData,
        );
    }
}
