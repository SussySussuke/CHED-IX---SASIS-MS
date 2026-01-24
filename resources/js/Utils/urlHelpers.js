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
