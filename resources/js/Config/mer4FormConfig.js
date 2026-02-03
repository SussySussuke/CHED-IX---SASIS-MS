/**
 * Configuration for MER4 Forms 1-3
 * 
 * This file is a PURE ORGANIZATIONAL LAYER that imports from formConfig.js
 * All form metadata (names) come from FORM_NAMES in formConfig.js
 * 
 * DO NOT duplicate metadata here! Import from formConfig instead.
 */

import { FORM_NAMES, MER_FORM_GROUPINGS } from './formConfig';

/**
 * Build service list for a MER4 form by reading from FORM_NAMES
 */
const buildServices = (formNumber) => {
  const annexLetters = MER_FORM_GROUPINGS[formNumber];
  
  return annexLetters.map((letter, index) => ({
    name: `${index + 1}. ${FORM_NAMES[letter]}`,
    annexType: letter,
    annexLetter: letter,
  }));
};

/**
 * MER4 Forms configuration
 * Metadata is generated from formConfig.js - DO NOT hardcode names here!
 */
export const MER4_FORMS = {
  1: {
    formNumber: 1,
    title: 'M&ER4 Form 1: Student Welfare Services',
    subtitle: 'Annexes A-D: Information & Orientation, Guidance & Counseling, Career & Job Placement, Economic Enterprise Development, Student Handbook',
    sectionTitle: 'B. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer4/form1',
    services: buildServices(1),
  },
  2: {
    formNumber: 2,
    title: 'M&ER4 Form 2: Student Welfare Services',
    subtitle: 'Annexes E-G: Student Activities, Student Discipline, Student Publication/Yearbook',
    sectionTitle: 'C. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer4/form2',
    services: buildServices(2),
  },
  3: {
    formNumber: 3,
    title: 'M&ER4 Form 3: Institutional Student Programs and Services',
    subtitle: 'Annexes H-O: Admission, Scholarships, Health, Safety, Housing, Special Needs, Cultural Arts, Community Programs',
    sectionTitle: 'C. INSTITUTIONAL STUDENT PROGRAMS AND SERVICES',
    endpoint: '/admin/mer4/form3',
    services: buildServices(3),
  },
};

/**
 * Get configuration for a specific MER4 form
 */
export const getMER4FormConfig = (formNumber) => {
  return MER4_FORMS[formNumber];
};
