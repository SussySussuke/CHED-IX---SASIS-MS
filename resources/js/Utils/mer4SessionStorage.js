/**
 * Session storage utility for MER4 form filters
 * Persists HEI and Academic Year selections across MER4 form pages during runtime
 * Automatically cleared when browser tab is closed
 */

const MER4_STORAGE_KEYS = {
  HEI_ID: 'mer4_selected_hei_id',
  ACADEMIC_YEAR: 'mer4_selected_academic_year',
};

/**
 * Save the selected HEI ID to session storage
 * @param {string|number} heiId - The HEI ID to save
 */
export const saveMER4HEI = (heiId) => {
  if (typeof window !== 'undefined' && heiId) {
    sessionStorage.setItem(MER4_STORAGE_KEYS.HEI_ID, String(heiId));
  }
};

/**
 * Save the selected Academic Year to session storage
 * @param {string} academicYear - The academic year to save (e.g., "2024-2025")
 */
export const saveMER4AcademicYear = (academicYear) => {
  if (typeof window !== 'undefined' && academicYear) {
    sessionStorage.setItem(MER4_STORAGE_KEYS.ACADEMIC_YEAR, academicYear);
  }
};

/**
 * Get the saved HEI ID from session storage
 * @returns {string|null} - The saved HEI ID or null
 */
export const getMER4HEI = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(MER4_STORAGE_KEYS.HEI_ID);
  }
  return null;
};

/**
 * Get the saved Academic Year from session storage
 * @returns {string|null} - The saved academic year or null
 */
export const getMER4AcademicYear = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(MER4_STORAGE_KEYS.ACADEMIC_YEAR);
  }
  return null;
};

/**
 * Clear all MER4 filter selections from session storage
 */
export const clearMER4Filters = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(MER4_STORAGE_KEYS.HEI_ID);
    sessionStorage.removeItem(MER4_STORAGE_KEYS.ACADEMIC_YEAR);
  }
};

/**
 * Save both HEI and Academic Year at once
 * @param {string|number} heiId - The HEI ID to save
 * @param {string} academicYear - The academic year to save
 */
export const saveMER4Filters = (heiId, academicYear) => {
  saveMER4HEI(heiId);
  saveMER4AcademicYear(academicYear);
};

/**
 * Get both HEI and Academic Year at once
 * @returns {{heiId: string|null, academicYear: string|null}}
 */
export const getMER4Filters = () => {
  return {
    heiId: getMER4HEI(),
    academicYear: getMER4AcademicYear(),
  };
};
