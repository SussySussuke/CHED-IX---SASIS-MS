/**
 * Routing configuration for non-Annex forms (MER forms, Summary, etc.)
 * 
 * These forms have different routing patterns from Annexes.
 * This file defines routes, metadata, and form names for non-Annex forms.
 * 
 * NOTE: Form names are defined here to avoid circular dependency with formConfig.js
 */

/**
 * Summary Form
 */
export const SUMMARY_FORM = {
  code: 'SUMMARY',
  name: 'Summary - School Details',
  route: '/hei/summary/create',
  category: 'Institutional Forms',
};

/**
 * MER (Monitoring and Evaluation Report) Forms
 */
export const MER_FORMS = {
  MER1: {
    code: 'MER1',
    name: 'HEI Profile on SAS',
    route: '/hei/mer1/create',
    category: 'MER Forms',
  },
  // Future: MER2, MER3, etc.
};

/**
 * Get route for a specific form code
 */
export const getFormRoute = (formCode) => {
  if (formCode === 'SUMMARY') return SUMMARY_FORM.route;
  if (MER_FORMS[formCode]) return MER_FORMS[formCode].route;
  return null;
};

/**
 * Check if a form is non-Annex (SUMMARY or MER)
 */
export const isNonAnnexForm = (formCode) => {
  return formCode === 'SUMMARY' || !!MER_FORMS[formCode];
};
