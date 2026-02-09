/**
 * Get academic year from URL parameter or fallback to default
 * @param {string} defaultYear - Default academic year to use if URL param not present
 * @returns {string} Academic year
 */
export const getAcademicYearFromUrl = (defaultYear = null) => {
  const urlParams = new URLSearchParams(window.location.search);
  const yearFromUrl = urlParams.get('year');
  
  if (yearFromUrl) {
    return yearFromUrl;
  }
  
  if (defaultYear) {
    return defaultYear;
  }
  
  // Fallback to current academic year
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  
  // Academic year typically starts in August/September
  if (currentMonth >= 8) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Build URL with year parameter
 * @param {string} baseUrl - Base URL without query parameters
 * @param {string} year - Academic year to append
 * @returns {string} URL with year parameter
 */
export const buildUrlWithYear = (baseUrl, year) => {
  if (!year) return baseUrl;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}year=${year}`;
};

/**
 * Get the create/submit URL for a given form code
 * Handles SUMMARY, MER forms, and Annexes with correct routing patterns
 * 
 * @param {string} formCode - Form code (e.g., 'SUMMARY', 'MER1', 'MER4A', 'A', 'B', etc.)
 * @param {string} year - Optional academic year parameter
 * @returns {string} Complete URL for creating/submitting the form
 * 
 * @example
 * getFormCreateUrl('SUMMARY', '2025-2026') // => '/hei/summary/create?year=2025-2026'
 * getFormCreateUrl('MER4A', '2025-2026') // => '/hei/mer4a/create?year=2025-2026'
 * getFormCreateUrl('A', '2025-2026') // => '/hei/annex-a/submit?year=2025-2026'
 */
export const getFormCreateUrl = (formCode, year = null) => {
  let baseUrl;
  
  // Handle SUMMARY
  if (formCode === 'SUMMARY') {
    baseUrl = '/hei/summary/create';
  }
  // Handle MER forms (MER1, MER2, MER3, MER4A, etc.)
  else if (formCode.startsWith('MER')) {
    baseUrl = `/hei/${formCode.toLowerCase()}/create`;
  }
  // Handle Annexes (A, B, C, C-1, D, etc.)
  else {
    baseUrl = `/hei/annex-${formCode.toLowerCase()}/submit`;
  }
  
  // Append year parameter if provided
  return buildUrlWithYear(baseUrl, year);
};
