import { profileConfig } from './profileConfig.jsx';
import { personnelConfig, PERSONNEL_DRILLDOWN_COLUMNS, PERSONNEL_RECATEGORIZE_OPTIONS, PERSONNEL_TIP } from './personnelConfig.jsx';
import { infoOrientationConfig, INFO_DRILLDOWN_COLUMNS, INFO_RECATEGORIZE_OPTIONS, INFO_TIP } from './infoOrientationConfig.jsx';
import { guidanceCounsellingConfig, GUIDANCE_DRILLDOWN_COLUMNS, GUIDANCE_RECATEGORIZE_OPTIONS, GUIDANCE_TIP } from './guidanceCounsellingConfig.jsx';
import { careerJobConfig, CAREER_JOB_DRILLDOWN_COLUMNS, CAREER_JOB_RECATEGORIZE_OPTIONS, CAREER_JOB_TIP } from './careerJobConfig.jsx';
import { healthConfig, HEALTH_DRILLDOWN_COLUMNS, HEALTH_RECATEGORIZE_OPTIONS, HEALTH_TIP } from './healthConfig.jsx';
import { admissionConfig } from './admissionConfig.jsx';
import { studentDisciplineConfig } from './studentDisciplineConfig.jsx';
import { socialCommunityConfig, SOCIAL_COMMUNITY_DRILLDOWN_COLUMNS, SOCIAL_COMMUNITY_TIP } from './socialCommunityConfig.jsx';
import { studentOrganizationConfig, STUDENT_ORG_DRILLDOWN_COLUMNS, STUDENT_ORG_TIP } from './studentOrganizationConfig.jsx';
import { cultureConfig, CULTURE_DRILLDOWN_COLUMNS, CULTURE_TIP } from './cultureConfig.jsx';
import { scholarshipConfig, SCHOLARSHIP_DRILLDOWN_COLUMNS, SCHOLARSHIP_TIP } from './scholarshipConfig.jsx';
import { safetySecurityConfig } from './safetySecurityConfig.jsx';
import { dormConfig, DORM_DRILLDOWN_COLUMNS, DORM_TIP } from './dormConfig.jsx';
import { specialNeedsStatsConfig } from './specialNeedsStatsConfig.jsx';

/**
 * Per-section drilldown registry.
 * Each entry describes how SummaryView should fetch and display the RecordsModal.
 *
 * Fields:
 *   fetchPath        — URL template, use {heiId}, {category}, {year} placeholders
 *   totalFetchPath   — URL for "View All" button (null if not needed)
 *   recategorizeUrl  — PATCH endpoint for reassigning categories (null if read-only)
 *   columnDefs       — drilldown grid columns
 *   categoryOptions  — recategorize checkbox options (empty = no recategorize UI)
 *   categoryLabel    — function(category) → display label (or static string)
 *   miscKey          — the category key that signals "miscellaneous / yellow" mode
 *   tip              — info banner text shown above the grid for this section
 *   recordTypeField  — field used as part of the row key for recategorize state
 *   recordIdField    — field used as part of the row key for recategorize state
 *
 * Sections WITHOUT a drilldown entry use no modal (static display only).
 */
export const SECTION_DRILLDOWN_REGISTRY = {
  '2-Info-Orientation': {
    fetchPath:       (heiId, category, year) => `/admin/summary/info-orientation/${heiId}/${category}/evidence?year=${year}`,
    totalFetchPath:  (heiId, year)           => `/admin/summary/info-orientation/${heiId}/total/evidence?year=${year}`,
    recategorizeUrl: '/admin/summary/info-orientation/programs/category',
    columnDefs:      INFO_DRILLDOWN_COLUMNS,
    categoryOptions: INFO_RECATEGORIZE_OPTIONS,
    miscKey:         'uncategorized',
    tip:             INFO_TIP,
    recordTypeField: 'program_type',
    recordIdField:   'id',
  },
  '1B-Personnel': {
    fetchPath:       (heiId, category, year) => `/admin/summary/personnel/${heiId}/${category}/evidence?year=${year}`,
    totalFetchPath:  (heiId, year)           => `/admin/summary/personnel/${heiId}/total/evidence?year=${year}`,
    recategorizeUrl: '/admin/summary/personnel/category',
    columnDefs:      PERSONNEL_DRILLDOWN_COLUMNS,
    categoryOptions: PERSONNEL_RECATEGORIZE_OPTIONS,
    miscKey:         'uncategorized',
    tip:             PERSONNEL_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '3-GuidanceCounselling': {
    fetchPath:       (heiId, category, year) => `/admin/summary/guidance-counselling/${heiId}/${category}/evidence?year=${year}`,
    totalFetchPath:  (heiId, year)           => `/admin/summary/guidance-counselling/${heiId}/total/evidence?year=${year}`,
    recategorizeUrl: '/admin/summary/guidance-counselling/category',
    columnDefs:      GUIDANCE_DRILLDOWN_COLUMNS,
    categoryOptions: GUIDANCE_RECATEGORIZE_OPTIONS,
    miscKey:         'others',
    tip:             GUIDANCE_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '4-CareerJob': {
    fetchPath:       (heiId, category, year) => `/admin/summary/career-job/${heiId}/${category}/evidence?year=${year}`,
    totalFetchPath:  (heiId, year)           => `/admin/summary/career-job/${heiId}/total/evidence?year=${year}`,
    recategorizeUrl: '/admin/summary/career-job/category',
    columnDefs:      CAREER_JOB_DRILLDOWN_COLUMNS,
    categoryOptions: CAREER_JOB_RECATEGORIZE_OPTIONS,
    miscKey:         'others',
    tip:             CAREER_JOB_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '5-Health': {
    fetchPath:       (heiId, category, year) => `/admin/summary/health/${heiId}/${category}/evidence?year=${year}`,
    totalFetchPath:  (heiId, year)           => `/admin/summary/health/${heiId}/total/evidence?year=${year}`,
    recategorizeUrl: '/admin/summary/health/category',
    columnDefs:      HEALTH_DRILLDOWN_COLUMNS,
    categoryOptions: HEALTH_RECATEGORIZE_OPTIONS,
    miscKey:         'others',
    tip:             HEALTH_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '8-SocialCommunity': {
    fetchPath:       (heiId, _category, year) => `/admin/summary/social-community/${heiId}/evidence?year=${year}`,
    totalFetchPath:  null,
    recategorizeUrl: null,
    columnDefs:      SOCIAL_COMMUNITY_DRILLDOWN_COLUMNS,
    categoryOptions: [],
    miscKey:         null,
    tip:             SOCIAL_COMMUNITY_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '9-StudentOrganization': {
    fetchPath:       (heiId, _category, year) => `/admin/summary/student-organization/${heiId}/evidence?year=${year}`,
    totalFetchPath:  null,
    recategorizeUrl: null,
    columnDefs:      STUDENT_ORG_DRILLDOWN_COLUMNS,
    categoryOptions: [],
    miscKey:         null,
    tip:             STUDENT_ORG_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '10-Culture': {
    fetchPath:       (heiId, _category, year) => `/admin/summary/culture/${heiId}/evidence?year=${year}`,
    totalFetchPath:  null,
    recategorizeUrl: null,
    columnDefs:      CULTURE_DRILLDOWN_COLUMNS,
    categoryOptions: [],
    miscKey:         null,
    tip:             CULTURE_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '11-Scholarship': {
    fetchPath:       (heiId, _category, year) => `/admin/summary/scholarship/${heiId}/evidence?year=${year}`,
    totalFetchPath:  null,
    recategorizeUrl: null,
    columnDefs:      SCHOLARSHIP_DRILLDOWN_COLUMNS,
    categoryOptions: [],
    miscKey:         null,
    tip:             SCHOLARSHIP_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
  '13-Dorm': {
    fetchPath:       (heiId, _category, year) => `/admin/summary/dorm/${heiId}/evidence?year=${year}`,
    totalFetchPath:  null,
    recategorizeUrl: null,
    columnDefs:      DORM_DRILLDOWN_COLUMNS,
    categoryOptions: [],
    miscKey:         null,
    tip:             DORM_TIP,
    recordTypeField: 'id',
    recordIdField:   'id',
  },
};

/**
 * Sections that require a dynamic fetch when selected.
 * Maps section ID → API path (year appended by the fetch handler).
 */
export const SECTION_FETCH_URLS = {
  '1A-Profile':            '/admin/summary/profile',
  '2-Info-Orientation':    '/admin/summary/info-orientation',
  '1B-Personnel':          '/admin/summary/personnel',
  '3-GuidanceCounselling': '/admin/summary/guidance-counselling',
  '4-CareerJob':           '/admin/summary/career-job',
  '5-Health':              '/admin/summary/health',
  '6-Admission':           '/admin/summary/admission',
  '7-StudentDiscipline':   '/admin/summary/student-discipline',
  '8-SocialCommunity':     '/admin/summary/social-community',
  '9-StudentOrganization': '/admin/summary/student-organization',
  '10-Culture':            '/admin/summary/culture',
  '11-Scholarship':        '/admin/summary/scholarship',
  '12-SafetySecurity':     '/admin/summary/safety-security',
  '13-Dorm':               '/admin/summary/dorm',
  '14-SpecialNeeds-Stats': '/admin/summary/special-needs-stats',
};

/** Tip text for sections not in SECTION_DRILLDOWN_REGISTRY */
export const SECTION_TIPS = {
  '6-Admission':           'Admission policy data from Annex H. Green = Yes, Red = No, — = not submitted.',
  '7-StudentDiscipline':   'Student Discipline data from Annex F. Green = Yes (field is filled), Red = No (field is empty), — = HEI has not submitted.',
  '12-SafetySecurity':     'Safety and security committee data from Annex K. Presence is determined by keyword matching on committee names submitted by each HEI. Green = Yes, Red = No, — = HEI has not submitted.',
  '14-SpecialNeeds-Stats': 'Students with special needs statistics from Annex M, Table 1. Figures shown are the Sub-Total for each category for the selected academic year only. — = HEI has not submitted.',
};

export const summaryConfig = {
  sections: {
    '1A-Profile':            profileConfig,
    '1B-Personnel':          personnelConfig,
    '2-Info-Orientation':    infoOrientationConfig,
    '3-GuidanceCounselling': guidanceCounsellingConfig,
    '4-CareerJob':           careerJobConfig,
    '5-Health':              healthConfig,
    '6-Admission':           admissionConfig,
    '7-StudentDiscipline':   studentDisciplineConfig,
    '8-SocialCommunity':     socialCommunityConfig,
    '9-StudentOrganization': studentOrganizationConfig,
    '10-Culture':            cultureConfig,
    '11-Scholarship':        scholarshipConfig,
    '12-SafetySecurity':     safetySecurityConfig,
    '13-Dorm':               dormConfig,
    '14-SpecialNeeds-Stats': specialNeedsStatsConfig,
  },

  gridDefaults: {
    height: 'calc(100vh - 350px)',
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],
    enableQuickFilter: true,
    quickFilterPlaceholder: 'Search by HEI name, code, type…',
  },

  getSection(sectionId) {
    return this.sections[sectionId] ?? null;
  },

  getSectionColumns(sectionId) {
    const section = this.getSection(sectionId);
    if (!section) return [];
    return section.getColumns ? section.getColumns() : (section.columns ?? []);
  },

  getSectionList() {
    return Object.entries(this.sections).map(([id, config]) => ({
      id,
      title: config.sectionTitle,
      sectionId: config.sectionId,
    }));
  },
};

export default summaryConfig;
