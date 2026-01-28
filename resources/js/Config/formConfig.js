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
