/**
 * Session storage utility for MER form filters
 * Persists HEI and Academic Year selections across MER form pages during runtime
 * Automatically cleared when browser tab is closed
 */

const MER_STORAGE_KEYS = {
  HEI_ID: 'mer_selected_hei_id',
  ACADEMIC_YEAR: 'mer_selected_academic_year',
};

/**
 * Save the selected HEI ID to session storage
 * @param {string|number} heiId - The HEI ID to save
 */
export const saveMERHEI = (heiId) => {
  if (typeof window !== 'undefined' && heiId) {
    sessionStorage.setItem(MER_STORAGE_KEYS.HEI_ID, String(heiId));
  }
};

/**
 * Save the selected Academic Year to session storage
 * @param {string} academicYear - The academic year to save (e.g., "2024-2025")
 */
export const saveMERAcademicYear = (academicYear) => {
  if (typeof window !== 'undefined' && academicYear) {
    sessionStorage.setItem(MER_STORAGE_KEYS.ACADEMIC_YEAR, academicYear);
  }
};

/**
 * Get the saved HEI ID from session storage
 * @returns {string|null} - The saved HEI ID or null
 */
export const getMERHEI = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(MER_STORAGE_KEYS.HEI_ID);
  }
  return null;
};

/**
 * Get the saved Academic Year from session storage
 * @returns {string|null} - The saved academic year or null
 */
export const getMERAcademicYear = () => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(MER_STORAGE_KEYS.ACADEMIC_YEAR);
  }
  return null;
};

/**
 * Clear all MER filter selections from session storage
 */
export const clearMERFilters = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(MER_STORAGE_KEYS.HEI_ID);
    sessionStorage.removeItem(MER_STORAGE_KEYS.ACADEMIC_YEAR);
  }
};

/**
 * Save both HEI and Academic Year at once
 * @param {string|number} heiId - The HEI ID to save
 * @param {string} academicYear - The academic year to save
 */
export const saveMERFilters = (heiId, academicYear) => {
  saveMERHEI(heiId);
  saveMERAcademicYear(academicYear);
};

/**
 * Get both HEI and Academic Year at once
 * @returns {{heiId: string|null, academicYear: string|null}}
 */
export const getMERFilters = () => {
  return {
    heiId: getMERHEI(),
    academicYear: getMERAcademicYear(),
  };
};
