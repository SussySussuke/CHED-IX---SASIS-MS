<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex D — Student Handbook
 *
 * Layout matches the visual design of the original CHED SASTOOL template
 * (restored in ExcelExportService::addAnnexDSheet):
 *
 *   Row 1     : [ANNEX_D] tag (yellow)
 *   Rows 3-5  : title block (plain bold, no fill)
 *   Rows 6-7  : Version/Publication date    — value in col C (merged C6:C7)
 *   Rows 8-9  : Officer-in-Charge           — value in col C (merged C8:C9)
 *   Rows 10-11: Handbook Committee          — value in col C (merged C10:C11)
 *   Row 12    : two-column section headers (no values)
 *   Rows 13-18: Dissemination (left) — col A = label, col B = value
 *               Type of Handbook (right) — col B = label, col C = value
 *               (type fields only on rows 13-16; rows 17-18 right side empty)
 *   Row 19    : spacer
 *   Row 20    : section header (no value)
 *   Rows 21-39: checkbox items — col A:B merged label, col C = value
 *
 * All reads are by explicit (row, column) — NOT by sequential $r++ — because
 * the two-column section means fields are no longer in a single sequential column.
 *
 * Booleans stored as YES/NO strings.
 */
class AnnexDParser extends BaseParser
{
    public function sheetId(): string { return 'ANNEX_D'; }
    public function label(): string   { return 'Annex D - Student Handbook'; }

    public function parse(Worksheet $ws): ParseResult
    {
        // ── Top three fields: value in col C (column index 3) ────────────
        $version_publication_date = $this->str($ws, 6,  3);
        $officer_in_charge        = $this->str($ws, 8,  3);
        $handbook_committee       = $this->longStr($ws, 10, 3);

        // ── Dissemination fields: value in col B (column index 2) ────────
        // Left side of the two-column section, rows 13-18
        $dissemination_orientation = $this->bool_($ws, 13, 2);
        $orientation_dates         = $this->str($ws,   14, 2);
        $mode_of_delivery          = $this->str($ws,   15, 2);
        $dissemination_uploaded    = $this->bool_($ws, 16, 2);
        $dissemination_others      = $this->bool_($ws, 17, 2);
        $dissemination_others_text = $this->str($ws,   18, 2);

        // ── Type fields: value in col C (column index 3) ─────────────────
        // Right side of the two-column section, rows 13-16
        $type_digital     = $this->bool_($ws, 13, 3);
        $type_printed     = $this->bool_($ws, 14, 3);
        $type_others      = $this->bool_($ws, 15, 3);
        $type_others_text = $this->str($ws,   16, 3);

        // ── Checkbox items: value in col C (column index 3) ──────────────
        // Rows 21-39: label merged A:B, value in C
        $has_academic_policies      = $this->bool_($ws, 21, 3);
        $has_admission_requirements = $this->bool_($ws, 22, 3);
        $has_code_of_conduct        = $this->bool_($ws, 23, 3);
        $has_scholarships           = $this->bool_($ws, 24, 3);
        $has_student_publication    = $this->bool_($ws, 25, 3);
        $has_housing_services       = $this->bool_($ws, 26, 3);
        $has_disability_services    = $this->bool_($ws, 27, 3);
        $has_student_council        = $this->bool_($ws, 28, 3);
        $has_refund_policies        = $this->bool_($ws, 29, 3);
        $has_drug_education         = $this->bool_($ws, 30, 3);
        $has_foreign_students       = $this->bool_($ws, 31, 3);
        $has_disaster_management    = $this->bool_($ws, 32, 3);
        $has_safe_spaces            = $this->bool_($ws, 33, 3);
        $has_anti_hazing            = $this->bool_($ws, 34, 3);
        $has_anti_bullying          = $this->bool_($ws, 35, 3);
        $has_violence_against_women = $this->bool_($ws, 36, 3);
        $has_gender_fair            = $this->bool_($ws, 37, 3);
        $has_others                 = $this->bool_($ws, 38, 3);
        $has_others_text            = $this->str($ws,   39, 3);

        // Sheet is empty if all key text fields are null and no checkbox is true
        $anyData = $version_publication_date || $officer_in_charge || $handbook_committee
            || $dissemination_orientation || $dissemination_uploaded || $type_digital
            || $type_printed || $has_academic_policies;

        $payload = compact(
            'version_publication_date', 'officer_in_charge', 'handbook_committee',
            'dissemination_orientation', 'orientation_dates', 'mode_of_delivery',
            'dissemination_uploaded', 'dissemination_others', 'dissemination_others_text',
            'type_digital', 'type_printed', 'type_others', 'type_others_text',
            'has_academic_policies', 'has_admission_requirements', 'has_code_of_conduct',
            'has_scholarships', 'has_student_publication', 'has_housing_services',
            'has_disability_services', 'has_student_council', 'has_refund_policies',
            'has_drug_education', 'has_foreign_students', 'has_disaster_management',
            'has_safe_spaces', 'has_anti_hazing', 'has_anti_bullying',
            'has_violence_against_women', 'has_gender_fair', 'has_others', 'has_others_text'
        );

        return new ParseResult(
            sheetId: $this->sheetId(),
            label:   $this->label(),
            payload: $payload,
            errors:  [],
            isEmpty: !$anyData,
        );
    }
}
