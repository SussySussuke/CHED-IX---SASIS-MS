/**
 * summaryTotalsConfig.js
 *
 * Computes a "Grand Total" pinned-bottom row for AGGridViewer.
 *
 * Design decisions:
 *   - Totals are always dataset-level (all rows in sectionData), NOT page-level.
 *     A grand total that changes as you page through is actively misleading.
 *   - Only numeric fields are summed. Text, boolean, and status fields → null
 *     (AGGridViewer renders null as "—" via the pinned-row guard).
 *   - Sections whose columns are entirely boolean flags (Admission, Discipline,
 *     SafetySecurity) return null — a count of "how many HEIs said Yes" is a
 *     different metric and not what this row should imply.
 *   - The label column (hei_name) always receives "Grand Total".
 *   - In comparison mode, field keys are prefixed as `${year}::${field}`.
 *     Delta columns (colId starts with "cmp::delta::") use valueGetter at
 *     render time — AG Grid automatically recalculates them for pinned rows,
 *     so we don't need to include them in the totals object.
 *
 * Usage:
 *   const totalsRow = computeTotalsRow(activeSection, sectionData, isComparing, selectedYears);
 *   // pass as pinnedBottomRowData={totalsRow ? [totalsRow] : []} to AGGridViewer
 */

import { SECTION_COMPARISON_FIELDS } from './comparisonConfig';

// ─── Sections that produce no meaningful numeric total ────────────────────────
// boolean-flag-only sections: summing Yes/No makes no sense as a grand total.
const NO_TOTALS_SECTIONS = new Set([
  '1A-Profile',          // text / URLs / status — no summable numeric columns
  '6-Admission',         // all boolean flags
  '7-StudentDiscipline', // all boolean flags
  '12-SafetySecurity',   // all boolean flags
]);

// ─── Per-section numeric field lists (single-year mode) ──────────────────────
// Defines which raw fields from the API row objects should be summed.
// Excludes hei_id, hei_code, hei_type, status, and any text/label fields.
const SECTION_NUMERIC_FIELDS = {
  '1B-Personnel': [
    'registered_guidance_counselors',
    'guidance_counseling',
    'career_guidance_placement',
    'registrars',
    'admission_personnel',
    'physician',
    'dentist',
    'nurse',
    'other_medical_health',
    'security_personnel',
    'food_service_personnel',
    'cultural_affairs',
    'sports_development',
    'student_discipline',
    'scholarship_personnel',
    'housing_residential',
    'pwd_special_needs',
    'student_governance',
    'student_publication',
    'multi_faith',
    'uncategorized',
    'total_personnel',
  ],

  '2-Info-Orientation': [
    'campus_orientation_activities', 'campus_orientation_students',
    'gender_sensitivity_activities',  'gender_sensitivity_students',
    'anti_hazing_activities',         'anti_hazing_students',
    'substance_abuse_activities',     'substance_abuse_students',
    'sexual_health_activities',       'sexual_health_students',
    'mental_health_activities',       'mental_health_students',
    'disaster_risk_activities',       'disaster_risk_students',
    'uncategorized_activities',       'uncategorized_students',
    'total_activities',               'total_students',
  ],

  '3-GuidanceCounselling': [
    'individual_inventory_activities', 'individual_inventory_students',
    'counseling_service_activities',   'counseling_service_students',
    'referral_activities',             'referral_students',
    'testing_appraisal_activities',    'testing_appraisal_students',
    'follow_up_activities',            'follow_up_students',
    'peer_facilitating_activities',    'peer_facilitating_students',
    'others_activities',               'others_students',
    'total_activities',                'total_students',
  ],

  '4-CareerJob': [
    'labor_empowerment_activities', 'labor_empowerment_students',
    'job_fairs_activities',         'job_fairs_students',
    'phil_job_net_activities',      'phil_job_net_students',
    'career_counseling_activities', 'career_counseling_students',
    'others_activities',            'others_students',
    'total_activities',             'total_students',
  ],

  '5-Health': [
    'medical_checkup_activities',     'medical_checkup_students',
    'dental_checkup_activities',      'dental_checkup_students',
    'seminar_educational_activities', 'seminar_educational_students',
    'others_activities',              'others_students',
    'total_activities',               'total_students',
  ],

  '8-SocialCommunity': [
    'total_activities',
    'total_participants',
  ],

  '9-StudentOrganization': [
    'total_organizations',
    'total_with_activities',
  ],

  '10-Culture': [
    'total_activities',
    'total_participants',
  ],

  '11-Scholarship': [
    'total_scholarships',
    'total_beneficiaries',
  ],

  '13-Dorm': [
    'total_housing',
    'male_count',
    'female_count',
    'coed_count',
  ],

  '14-SpecialNeeds-Stats': [
    'pwd_enrollment',
    'pwd_graduates',
    'ip_enrollment',
    'ip_graduates',
    'solo_parent_enrollment',
    'solo_parent_graduates',
  ],
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * computeTotalsRow
 *
 * @param {string}   sectionId     - Active section ID (e.g. '1B-Personnel')
 * @param {Array}    rows          - The full sectionData array (all rows, not just visible page)
 * @param {boolean}  isComparing   - Whether multi-year comparison mode is active
 * @param {string[]} selectedYears - Array of selected years (used in comparison mode)
 * @returns {Object|null} - A row object for pinnedBottomRowData, or null if not applicable
 */
export function computeTotalsRow(sectionId, rows, isComparing, selectedYears) {
  if (NO_TOTALS_SECTIONS.has(sectionId)) return null;
  if (!rows || rows.length === 0) return null;

  const totals = {
    __isGrandTotal: true,
    hei_name: 'Grand Total',
    hei_code: null,
    hei_type: null,
    status:   null,
  };

  if (isComparing) {
    return computeComparisonTotals(sectionId, rows, selectedYears, totals);
  }

  return computeSingleYearTotals(sectionId, rows, totals);
}

// ─── Single-year mode ─────────────────────────────────────────────────────────

function computeSingleYearTotals(sectionId, rows, totals) {
  const fields = SECTION_NUMERIC_FIELDS[sectionId];
  if (!fields || fields.length === 0) return null;

  for (const field of fields) {
    totals[field] = sumField(rows, field);
  }

  return totals;
}

// ─── Comparison mode ──────────────────────────────────────────────────────────

function computeComparisonTotals(sectionId, rows, selectedYears, totals) {
  const config = SECTION_COMPARISON_FIELDS[sectionId];
  if (!config) return null;

  // Collect all numeric fields from the section's comparison config
  const numericFields = config.groups
    ? config.groups.flatMap((g) => g.fields.filter((f) => f.type === 'numeric').map((f) => f.field))
    : (config.fields ?? []).filter((f) => f.type === 'numeric').map((f) => f.field);

  if (numericFields.length === 0) return null;

  // Sum each prefixed key: `${year}::${field}`
  for (const year of selectedYears) {
    for (const field of numericFields) {
      const key = `${year}::${field}`;
      totals[key] = sumField(rows, key);
    }
  }

  // Delta columns use valueGetter — AG Grid recomputes them automatically for
  // pinned rows as long as the source prefixed keys are present (which they are
  // from the loop above). Nothing extra needed here.

  return totals;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sums a numeric field across all rows, treating null/undefined as 0.
 * Returns null (rendered as "—") if every row in the dataset has null/undefined
 * for this field — meaning no HEI submitted data for it at all.
 */
function sumField(rows, field) {
  let total       = 0;
  let hasAnyValue = false;

  for (const row of rows) {
    const v = row[field];
    if (v !== null && v !== undefined) {
      hasAnyValue = true;
      total += Number(v) || 0;
    }
  }

  return hasAnyValue ? total : null;
}
