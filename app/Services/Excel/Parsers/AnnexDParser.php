<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex D — Student Handbook
 * Layout: two-column key/value table.
 * Col 1: field label (locked), Col 2: value
 * DATA_ROW_START = 5
 *
 * Booleans stored as YES/NO strings.
 */
class AnnexDParser extends BaseParser
{
    private const DATA_ROW_START = 5;

    public function sheetId(): string { return 'ANNEX_D'; }
    public function label(): string   { return 'Annex D - Student Handbook'; }

    public function parse(Worksheet $ws): ParseResult
    {
        // Read key/value pairs starting from row 5
        // Each row: col 1 = field key (we match by position, not text, for robustness)
        // Defined order matches the AnnexDSubmission fillable fields

        $r = self::DATA_ROW_START;

        $version_publication_date = $this->str($ws, $r++, 2);
        $officer_in_charge        = $this->str($ws, $r++, 2);
        $handbook_committee       = $this->longStr($ws, $r++, 2);

        // Dissemination
        $dissemination_orientation = $this->bool_($ws, $r++, 2);
        $orientation_dates         = $this->str($ws, $r++, 2);
        $mode_of_delivery          = $this->str($ws, $r++, 2);
        $dissemination_uploaded    = $this->bool_($ws, $r++, 2);
        $dissemination_others      = $this->bool_($ws, $r++, 2);
        $dissemination_others_text = $this->str($ws, $r++, 2);

        // Type
        $type_digital      = $this->bool_($ws, $r++, 2);
        $type_printed      = $this->bool_($ws, $r++, 2);
        $type_others       = $this->bool_($ws, $r++, 2);
        $type_others_text  = $this->str($ws, $r++, 2);

        // Contents checklist
        $has_academic_policies      = $this->bool_($ws, $r++, 2);
        $has_admission_requirements = $this->bool_($ws, $r++, 2);
        $has_code_of_conduct        = $this->bool_($ws, $r++, 2);
        $has_scholarships           = $this->bool_($ws, $r++, 2);
        $has_student_publication    = $this->bool_($ws, $r++, 2);
        $has_housing_services       = $this->bool_($ws, $r++, 2);
        $has_disability_services    = $this->bool_($ws, $r++, 2);
        $has_student_council        = $this->bool_($ws, $r++, 2);
        $has_refund_policies        = $this->bool_($ws, $r++, 2);
        $has_drug_education         = $this->bool_($ws, $r++, 2);
        $has_foreign_students       = $this->bool_($ws, $r++, 2);
        $has_disaster_management    = $this->bool_($ws, $r++, 2);
        $has_safe_spaces            = $this->bool_($ws, $r++, 2);
        $has_anti_hazing            = $this->bool_($ws, $r++, 2);
        $has_anti_bullying          = $this->bool_($ws, $r++, 2);
        $has_violence_against_women = $this->bool_($ws, $r++, 2);
        $has_gender_fair            = $this->bool_($ws, $r++, 2);
        $has_others                 = $this->bool_($ws, $r++, 2);
        $has_others_text            = $this->str($ws, $r++, 2);

        // Sheet is empty if all text fields are null and no checkbox is true
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
