import { profileConfig } from './profileConfig.jsx';
import { personnelConfig } from './personnelConfig.jsx';
import { infoOrientationConfig } from './infoOrientationConfig.jsx';

/**
 * Summary View Master Configuration
 * 
 * This config orchestrates all section configurations for the Summary View.
 * Each section represents a specific data category with its own column definitions.
 * 
 * Available Sections:
 * - 1A-Profile: Basic institution information
 * - 1B-Personnel: Student population demographics
 * - 2-Info-Orientation: Information and Orientation Services & Activities
 * 
 * Usage:
 * import { summaryConfig } from '@/config/summaryView/summaryConfig';
 * 
 * // Get specific section
 * const profileColumns = summaryConfig.getSection('1A-Profile').columns;
 * 
 * // Get all columns (combined view)
 * const allColumns = summaryConfig.getAllColumns();
 * 
 * // Get available sections
 * const sections = summaryConfig.getSectionList();
 */
export const summaryConfig = {
  // Section registry
  sections: {
    '1A-Profile': profileConfig,
    '1B-Personnel': personnelConfig,
    '2-Info-Orientation': infoOrientationConfig,
  },

  // Grid default settings
  gridDefaults: {
    height: 'calc(100vh - 350px)',
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    enableQuickFilter: true,
    quickFilterPlaceholder: 'Search by HEI name, code, type...',
  },

  /**
   * Get a specific section configuration
   * @param {string} sectionId - The section identifier (e.g., '1A-Profile')
   * @returns {object} Section configuration object
   */
  getSection(sectionId) {
    return this.sections[sectionId] || null;
  },

  /**
   * Get columns for a specific section
   * @param {string} sectionId - The section identifier
   * @returns {array} Array of column definitions
   */
  getSectionColumns(sectionId) {
    const section = this.getSection(sectionId);
    return section ? section.columns : [];
  },

  /**
   * Get all columns from all sections (combined view)
   * Useful for displaying all data in a single grid
   * @returns {array} Combined array of all column definitions
   */
  getAllColumns() {
    const allColumns = [];
    const processedFields = new Set();

    Object.values(this.sections).forEach(section => {
      section.columns.forEach(column => {
        // Avoid duplicate columns by field name
        if (!processedFields.has(column.field)) {
          allColumns.push(column);
          processedFields.add(column.field);
        }
      });
    });

    return allColumns;
  },

  /**
   * Get list of available sections with metadata
   * @returns {array} Array of section objects with id and title
   */
  getSectionList() {
    return Object.entries(this.sections).map(([id, config]) => ({
      id,
      title: config.sectionTitle,
      sectionId: config.sectionId,
    }));
  },

  /**
   * Merge multiple section columns
   * @param {array} sectionIds - Array of section IDs to merge
   * @returns {array} Merged column definitions
   */
  mergeSections(sectionIds) {
    const mergedColumns = [];
    const processedFields = new Set();

    sectionIds.forEach(sectionId => {
      const columns = this.getSectionColumns(sectionId);
      columns.forEach(column => {
        if (!processedFields.has(column.field)) {
          mergedColumns.push(column);
          processedFields.add(column.field);
        }
      });
    });

    return mergedColumns;
  },
};

export default summaryConfig;
