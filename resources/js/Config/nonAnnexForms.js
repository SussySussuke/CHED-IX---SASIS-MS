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
  name: '1A - Profile',
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
  MER2: {
    code: 'MER2',
    name: 'HEI Directory of SAS',
    route: '/hei/mer2/create',
    category: 'MER Forms',
  },
  MER3: {
    code: 'MER3',
    name: 'Matrix of School Fees for SAS',
    route: '/hei/mer3/create',
    category: 'MER Forms',
  },
  MER4A: {
    code: 'MER4A',
    name: 'SAS Programs and Services Strategic Approaches/Actions',
    route: '/hei/mer4a/create',
    category: 'MER Forms',
  },
};

/**
 * Get route for a specific form code
 * Handles: SUMMARY, MER forms, and all Annex forms (A-O including hyphenated variants)
 */
export const getFormRoute = (formCode) => {
  if (formCode === 'SUMMARY') return SUMMARY_FORM.route;
  if (MER_FORMS[formCode]) return MER_FORMS[formCode].route;

  // Annex forms: convert code to URL segment (e.g. 'C-1' → 'annex-c-1', 'M' → 'annex-m')
  if (formCode && typeof formCode === 'string') {
    const segment = formCode.toLowerCase().replace(/_/g, '-');
    return `/hei/annex-${segment}/submit`;
  }

  return null;
};

/**
 * Check if a form is non-Annex (SUMMARY or MER)
 */
export const isNonAnnexForm = (formCode) => {
  return formCode === 'SUMMARY' || !!MER_FORMS[formCode];
};
