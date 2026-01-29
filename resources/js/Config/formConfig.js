/**
 * Main configuration file for Annex A-O
 * 
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR:
 * - Annex display names (ANNEX_NAMES)
 * - Annex priority order (ANNEX_PRIORITY_ORDER)
 * - Form field configurations (ANNEX_CONFIG)
 * 
 * When you need to add/remove/reorder annexes, change it here and ONLY here!
 */

import { FORM1_ANNEXES } from './annexConfigs/form1Annexes';
import { FORM2_ANNEXES } from './annexConfigs/form2Annexes';
import { FORM3_ANNEXES } from './annexConfigs/form3Annexes';

/**
 * SINGLE SOURCE OF TRUTH: Priority order for all annexes
 * This defines the canonical order for iterating through annexes
 * Used in: QuickActions, Checklist ordering, Form navigation, etc.
 * 
 * IMPORTANT: When adding a new annex, add it to this array in the correct position!
 */
export const ANNEX_PRIORITY_ORDER = [
  'SUMMARY',
  'A',
  'B',
  'C',
  'C-1',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'I-1',
  'J',
  'K',
  'L',
  'L-1',
  'M',
  'N',
  'N-1',
  'O'
];

/**
 * SINGLE SOURCE OF TRUTH: Annex display names
 * Used throughout the application for consistent naming
 */
export const ANNEX_NAMES = {
  A: 'Information and Orientation Services',
  B: 'Guidance and Counseling Service',
  C: 'Career and Job Placement Services',
  'C-1': 'Economic Enterprise Development',
  D: 'Student Handbook',
  E: 'Student Organizations',
  F: 'Student Discipline',
  G: 'Student Publication',
  H: 'Admission Services',
  I: 'Scholarships/Financial Assistance',
  'I-1': 'Food Services',
  J: 'Health Services',
  K: 'Safety and Security Committees',
  L: 'Student Housing',
  'L-1': 'Foreign/International Students Services',
  M: 'Sports Development',
  N: 'Culture and the Arts',
  'N-1': 'Sports Development Program',
  O: 'Community Involvement/Outreach',
};

/**
 * SINGLE SOURCE OF TRUTH: Annex metadata for MER forms
 * Maps annex letters to their service numbers and database types
 * Used by both frontend (merFormConfig) and backend (MERFormBuilder)
 */
export const ANNEX_METADATA = {
  A: { serviceNumber: '1', annexType: 'annex_a', name: 'Information and Orientation Services' },
  B: { serviceNumber: '2', annexType: 'annex_b', name: 'Guidance and Counseling Service' },
  C: { serviceNumber: '3', annexType: 'annex_c', name: 'Career and Job Placement Services' },
  'C-1': { serviceNumber: '4', annexType: 'annex_c_1', name: 'Economic Enterprise Development' },
  D: { serviceNumber: '5', annexType: 'annex_d', name: 'Student Handbook' },
  E: { serviceNumber: '1', annexType: 'annex_e', name: 'Student Organizations' },
  F: { serviceNumber: '5', annexType: 'annex_f', name: 'Student Discipline' },
  G: { serviceNumber: '6', annexType: 'annex_g', name: 'Student Publication' },
  H: { serviceNumber: '1', annexType: 'annex_h', name: 'Admission Services' },
  I: { serviceNumber: '2', annexType: 'annex_i', name: 'Scholarships/Financial Assistance' },
  'I-1': { serviceNumber: '3', annexType: 'annex_i_1', name: 'Food Services' },
  J: { serviceNumber: '4', annexType: 'annex_j', name: 'Health Services' },
  K: { serviceNumber: '5', annexType: 'annex_k', name: 'Safety and Security Committees' },
  L: { serviceNumber: '6', annexType: 'annex_l', name: 'Student Housing' },
  'L-1': { serviceNumber: '7', annexType: 'annex_l_1', name: 'Foreign/International Students Services' },
  M: { serviceNumber: '8', annexType: 'annex_m', name: 'Sports Development' },
  N: { serviceNumber: '9', annexType: 'annex_n', name: 'Culture and the Arts' },
  'N-1': { serviceNumber: '10', annexType: 'annex_n_1', name: 'Sports Development Program' },
  O: { serviceNumber: '11', annexType: 'annex_o', name: 'Community Involvement/Outreach' },
};

/**
 * SINGLE SOURCE OF TRUTH: MER Form groupings
 * Defines which annexes belong to which MER form for CHED review
 * Change these arrays to reorganize MER forms
 */
export const MER_FORM_GROUPINGS = {
  1: ['A', 'B', 'C', 'C-1', 'D'],
  2: ['E', 'F', 'G'],
  3: ['H', 'I', 'I-1', 'J', 'K', 'L', 'L-1', 'M', 'N', 'N-1', 'O'],
};

/**
 * Merged configuration for all annexes
 * Organized by MER Forms 1-3 for better maintainability
 * Contains form field definitions (columns, mappers, endpoints)
 */
export const ANNEX_CONFIG = {
  ...FORM1_ANNEXES,  // A, B, C, C-1
  ...FORM2_ANNEXES,  // E, F
  ...FORM3_ANNEXES   // I, J, K, L, N, O
};

/**
 * Get all valid annex codes (excluding SUMMARY)
 * @returns {string[]} Array of annex codes (A, B, C, C-1, D, etc.)
 */
export const getAllAnnexCodes = () => {
  return ANNEX_PRIORITY_ORDER.filter(code => code !== 'SUMMARY');
};

/**
 * Get display name for an annex
 * @param {string} annexLetter - Letter of the annex (A, B, C, C-1, etc.)
 * @returns {string} Display name for the annex
 */
export const getAnnexName = (annexLetter) => {
  const normalizedKey = annexLetter.toUpperCase();
  return ANNEX_NAMES[normalizedKey] || `Annex ${annexLetter}`;
};

/**
 * Get configuration for a specific annex
 * @param {string} annexLetter - Letter of the annex (A, B, C, C-1, etc.)
 * @returns {object} Configuration object for the annex
 */
export const getAnnexConfig = (annexLetter) => {
  const normalizedKey = annexLetter.toUpperCase();
  const config = ANNEX_CONFIG[normalizedKey];
  if (!config) {
    throw new Error(`No configuration found for Annex ${annexLetter}`);
  }
  return config;
};

/**
 * Check if an annex code is valid
 * @param {string} annexLetter - Letter to check
 * @returns {boolean} True if valid annex code
 */
export const isValidAnnex = (annexLetter) => {
  const normalizedKey = annexLetter.toUpperCase();
  return ANNEX_PRIORITY_ORDER.includes(normalizedKey);
};

/**
 * Get the next annex in priority order
 * @param {string} currentAnnex - Current annex code
 * @returns {string|null} Next annex code or null if at end
 */
export const getNextAnnex = (currentAnnex) => {
  const currentIndex = ANNEX_PRIORITY_ORDER.indexOf(currentAnnex);
  if (currentIndex === -1 || currentIndex === ANNEX_PRIORITY_ORDER.length - 1) {
    return null;
  }
  return ANNEX_PRIORITY_ORDER[currentIndex + 1];
};

/**
 * Get the previous annex in priority order
 * @param {string} currentAnnex - Current annex code
 * @returns {string|null} Previous annex code or null if at start
 */
export const getPreviousAnnex = (currentAnnex) => {
  const currentIndex = ANNEX_PRIORITY_ORDER.indexOf(currentAnnex);
  if (currentIndex <= 0) {
    return null;
  }
  return ANNEX_PRIORITY_ORDER[currentIndex - 1];
};
