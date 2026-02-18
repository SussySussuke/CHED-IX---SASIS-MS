import { profileConfig } from './profileConfig.jsx';
import { personnelConfig } from './personnelConfig.jsx';
import { infoOrientationConfig } from './infoOrientationConfig.jsx';

export const summaryConfig = {
  sections: {
    '1A-Profile':        profileConfig,
    '1B-Personnel':      personnelConfig,
    '2-Info-Orientation': infoOrientationConfig,
  },

  gridDefaults: {
    height: 'calc(100vh - 350px)',
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    enableQuickFilter: true,
    quickFilterPlaceholder: 'Search by HEI name, code, type…',
  },

  /** Get a specific section config object */
  getSection(sectionId) {
    return this.sections[sectionId] ?? null;
  },

  /**
   * Get columns for a section.
   * Sections that expose getColumns() (e.g. 2-Info-Orientation) use that;
   * sections with a static .columns array use that directly.
   */
  getSectionColumns(sectionId) {
    const section = this.getSection(sectionId);
    if (!section) return [];
    return section.getColumns ? section.getColumns() : (section.columns ?? []);
  },

  /** List of all sections for UI selectors */
  getSectionList() {
    return Object.entries(this.sections).map(([id, config]) => ({
      id,
      title: config.sectionTitle,
      sectionId: config.sectionId,
    }));
  },
};

export default summaryConfig;
