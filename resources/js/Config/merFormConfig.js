/**
 * Configuration for MER Forms 1-3
 * 
 * This file is now a PURE ORGANIZATIONAL LAYER that imports from formConfig.js
 * All annex metadata (names, types, service numbers) come from formConfig.js
 * 
 * DO NOT duplicate metadata here! Import from formConfig instead.
 */

import { ANNEX_METADATA, MER_FORM_GROUPINGS } from './formConfig';

/**
 * Build service list for a MER form by reading from formConfig metadata
 */
const buildServices = (formNumber) => {
  const annexLetters = MER_FORM_GROUPINGS[formNumber];
  
  return annexLetters.map(letter => {
    const metadata = ANNEX_METADATA[letter];
    if (!metadata) {
      throw new Error(`No metadata found for Annex ${letter} in formConfig.js`);
    }
    
    return {
      name: `${metadata.serviceNumber}. ${metadata.name}`,
      annexType: metadata.annexType,
      annexLetter: letter,
    };
  });
};

/**
 * MER Forms configuration
 * Metadata is generated from formConfig.js - DO NOT hardcode names/types here!
 */
export const MER_FORMS = {
  1: {
    formNumber: 1,
    title: 'Form 1: Student Welfare Services',
    subtitle: 'Annexes A-D: Information & Orientation, Guidance & Counseling, Career & Job Placement, Economic Enterprise Development, Student Handbook',
    sectionTitle: 'B. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer/form1',
    services: buildServices(1),
  },
  2: {
    formNumber: 2,
    title: 'Form 2: Student Welfare Services',
    subtitle: 'Annexes E-G: Student Activities, Student Discipline, Student Publication/Yearbook',
    sectionTitle: 'C. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer/form2',
    services: buildServices(2),
  },
  3: {
    formNumber: 3,
    title: 'Form 3: Institutional Student Programs and Services',
    subtitle: 'Annexes H-O: Admission, Scholarships, Health, Safety, Housing, Special Needs, Cultural Arts, Community Programs',
    sectionTitle: 'C. INSTITUTIONAL STUDENT PROGRAMS AND SERVICES',
    endpoint: '/admin/mer/form3',
    services: buildServices(3),
  },
};

/**
 * Get configuration for a specific form
 */
export const getMERFormConfig = (formNumber) => {
  return MER_FORMS[formNumber];
};
