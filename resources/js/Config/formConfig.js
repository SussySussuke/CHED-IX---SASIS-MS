/**
 * Main configuration file for ALL Forms (Summary, MER, Annexes)
 * 
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR:
 * - Form priority order (PRIORITY_ORDER)
 * - Form display names (FORM_NAMES)
 * - Annex field configurations (ANNEX_CONFIG)
 * 
 * When you need to add/remove/reorder forms, change it here and ONLY here!
 */

import { FORM1_ANNEXES } from './annexConfigs/form1Annexes';
import { FORM2_ANNEXES } from './annexConfigs/form2Annexes';
import { FORM3_ANNEXES } from './annexConfigs/form3Annexes';
import { SUMMARY_FORM, MER_FORMS } from './nonAnnexForms';

/**
 * SINGLE SOURCE OF TRUTH: Priority order for ALL forms
 * Used in: QuickActions, Checklist ordering, Form navigation, etc.
 */
export const PRIORITY_ORDER = [
  'SUMMARY',
  'MER1',
  'MER2',
  'MER3',
  'MER4',
  'A',
  'B',
  'C',
  'C-1',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'I-1',
  'J',
  'K',
  'L',
  'L-1',
  'M',
  'N',
  'N-1',
  'O'
];

/**
 * SINGLE SOURCE OF TRUTH: Display names for ALL forms
 */
export const FORM_NAMES = {
  SUMMARY: 'Summary - School Details',
  MER1: 'HEI Profile on SAS',
  MER2: 'HEI Directory of SAS',
  MER3: 'Matrix of School Fees for SAS',
  MER4: 'SAS Programs and Services Strategic Approaches/Actions',
  A: 'Information and Orientation Services',
  B: 'Guidance and Counseling Service',
  C: 'Career and Job Placement Services',
  'C-1': 'Economic Enterprise Development',
  D: 'Student Handbook',
  E: 'Student Organizations',
  F: 'Student Discipline',
  G: 'Student Publication',
  H: 'Admission Services',
  I: 'Scholarships/Financial Assistance',
  'I-1': 'Food Services',
  J: 'Health Services',
  K: 'Safety and Security Committees',
  L: 'Student Housing',
  'L-1': 'Foreign/International Students Services',
  M: 'Sports Development',
  N: 'Culture and the Arts',
  'N-1': 'Sports Development Program',
  O: 'Community Involvement/Outreach',
};

/**
 * MER4 Form groupings - which annexes belong to which MER4 form
 */
export const MER_FORM_GROUPINGS = {
  1: ['A', 'B', 'C', 'C-1', 'D'],
  2: ['E', 'F', 'G'],
  3: ['H', 'I', 'I-1', 'J', 'K', 'L', 'L-1', 'M', 'N', 'N-1', 'O'],
};

/**
 * Merged configuration for all annexes
 * Contains form field definitions (columns, mappers, endpoints)
 */
export const ANNEX_CONFIG = {
  ...FORM1_ANNEXES,
  ...FORM2_ANNEXES,
  ...FORM3_ANNEXES
};

/**
 * Get display name for any form
 */
export const getFormName = (formCode) => {
  return FORM_NAMES[formCode] || `Form ${formCode}`;
};



/**
 * Get configuration for a specific annex
 */
export const getAnnexConfig = (annexLetter) => {
  const config = ANNEX_CONFIG[annexLetter];
  if (!config) {
    throw new Error(`No configuration found for Annex ${annexLetter}`);
  }
  return config;
};

/**
 * Get all annex codes only (excluding SUMMARY and MER forms)
 */
export const getAllAnnexCodes = () => {
  return PRIORITY_ORDER.filter(code => 
    code !== 'SUMMARY' && !code.startsWith('MER')
  );
};

/**
 * Check if a form code is valid
 */
export const isValidForm = (formCode) => {
  return PRIORITY_ORDER.includes(formCode);
};

/**
 * Get the next form in priority order
 */
export const getNextForm = (currentForm) => {
  const currentIndex = PRIORITY_ORDER.indexOf(currentForm);
  if (currentIndex === -1 || currentIndex === PRIORITY_ORDER.length - 1) {
    return null;
  }
  return PRIORITY_ORDER[currentIndex + 1];
};

/**
 * Get the previous form in priority order
 */
export const getPreviousForm = (currentForm) => {
  const currentIndex = PRIORITY_ORDER.indexOf(currentForm);
  if (currentIndex <= 0) {
    return null;
  }
  return PRIORITY_ORDER[currentIndex - 1];
};

/**
 * Build grouped form options for selects
 * Returns structured data with groups and options
 * Used by: FormSelector, SubmissionFilters, etc.
 */
export const buildFormOptionsGrouped = () => {
  return [
    {
      group: SUMMARY_FORM.category,
      options: [{ value: SUMMARY_FORM.code, label: SUMMARY_FORM.name }]
    },
    {
      group: 'MER Forms',
      options: Object.values(MER_FORMS).map(form => ({
        value: form.code,
        label: form.name
      }))
    },
    {
      group: 'Student Services Annexes',
      options: getAllAnnexCodes().map(annex => ({
        value: annex,
        label: `Annex ${annex} - ${FORM_NAMES[annex]}`
      }))
    }
  ];
};

