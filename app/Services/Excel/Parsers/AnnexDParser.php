<?php

namespace App\Services\Excel\Parsers;

use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Annex D — Student Handbook
 *
 * Layout matches ExcelExportService::addAnnexDSheet (mirrors original CHED template):
 *
 *   Row 1  : [ANNEX_D] tag
 *   Rows 2-4: title block
 *   Row 5  : "Version/ Publication date: <value>" (merged A:C)
 *   Row 8  : "Officer-in-Charge: <value>"          (merged A:C)
 *   Row 10 : "Composition of the Student Handbook Committee: <value>" (merged A:C)
 *   Row 12 : A12 = "Mode of Dissemination: <value>"  B12 = "Type of Handbook" header
 *   Row 13 : A13 = checkbox Orientation   B13 = checkbox Digital Copy   C13 = hidden YES/NO (type_others)
 *   Row 14 : A14 = "Date/s of Orientation: <dates>"  B14 = checkbox Printed
 *   Row 15 : A15 = "Mode of delivery"   B15 = "Others, please specify _____"
 *   Row 16 : A16 = "(F2F/online or both): <value>"   B16 = <type_others_text>
 *   Row 17 : A17 = checkbox Uploaded in Website
 *   Row 18 : A18 = checkbox Others, please specify: <text>
 *   Row 20 : "Contains the following..." header
 *   Rows 21-38: checkbox + label (merged A:C) -- checkbox_() reads leading char
 *   Row 39 : free-text for has_others_text
 */
class AnnexDParser extends BaseParser
{
    public function sheetId(): string { return 'ANNEX_D'; }
    public function label(): string   { return 'Annex D - Student Handbook'; }

    public function parse(Worksheet $ws): ParseResult
    {
        // Strip label prefix from inline label+value cells.
        $strip = function (string $raw, string $prefix): ?string {
            $raw = trim($raw);
            if (str_starts_with($raw, $prefix)) {
                $val = trim(substr($raw, strlen($prefix)));
                return $val !== '' ? $val : null;
            }
            $pos = strpos($raw, ':');
            return $pos !== false ? (trim(substr($raw, $pos + 1)) ?: null) : ($raw ?: null);
        };

        // Top three fields: full label+value embedded in col A
        $version_publication_date = $strip((string) $this->cell($ws, 5,  1), 'Version/ Publication date:');
        $officer_in_charge        = $strip((string) $this->cell($ws, 8,  1), 'Officer-in-Charge:');
        $handbook_committee       = $strip((string) $this->cell($ws, 10, 1), 'Composition of the Student Handbook Committee:');

        // Dissemination fields:
        //   Checkboxes now in col B (bool_), not col A (checkbox_)
        //   Orientation dates in col B row 14 (plain text, no label prefix)
        //   Mode of delivery in col B row 15
        //   Others specify text in col C row 18
        $dissemination_orientation = $this->bool_($ws, 13, 2);
        $orientation_dates         = $this->str($ws, 14, 2);
        $mode_of_delivery          = $this->str($ws, 15, 2);
        $dissemination_uploaded    = $this->bool_($ws, 17, 2);
        $dissemination_others      = $this->bool_($ws, 18, 2);
        $dissemination_others_text = $this->str($ws, 18, 3);

        // Type fields now in col D (bool_), specify text embedded in col C label
        $type_digital     = $this->bool_($ws, 13, 4);
        $type_printed     = $this->bool_($ws, 14, 4);
        $type_others      = $this->bool_($ws, 15, 4);
        $type_others_text = $this->str($ws, 16, 3);

        // Checkbox items: col D rows 21-38 (bool_()), free text row 39 col A
        $has_academic_policies      = $this->bool_($ws, 21, 4);
        $has_admission_requirements = $this->bool_($ws, 22, 4);
        $has_code_of_conduct        = $this->bool_($ws, 23, 4);
        $has_scholarships           = $this->bool_($ws, 24, 4);
        $has_student_publication    = $this->bool_($ws, 25, 4);
        $has_housing_services       = $this->bool_($ws, 26, 4);
        $has_disability_services    = $this->bool_($ws, 27, 4);
        $has_student_council        = $this->bool_($ws, 28, 4);
        $has_refund_policies        = $this->bool_($ws, 29, 4);
        $has_drug_education         = $this->bool_($ws, 30, 4);
        $has_foreign_students       = $this->bool_($ws, 31, 4);
        $has_disaster_management    = $this->bool_($ws, 32, 4);
        $has_safe_spaces            = $this->bool_($ws, 33, 4);
        $has_anti_hazing            = $this->bool_($ws, 34, 4);
        $has_anti_bullying          = $this->bool_($ws, 35, 4);
        $has_violence_against_women = $this->bool_($ws, 36, 4);
        $has_gender_fair            = $this->bool_($ws, 37, 4);
        $has_others                 = $this->bool_($ws, 38, 4);
        $has_others_text            = $this->str($ws, 39, 1);

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
