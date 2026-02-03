/**
 * Central export for all annex renderers
 * Simplifies imports and provides a single source of truth for rendering logic
 */
import React from 'react';
import { renderAnnexD, renderAnnexG, renderAnnexH, renderAnnexM, renderSummary } from '../AnnexRenderers';
import { renderGenericAnnex } from './GenericRenderer';
import { renderMER1 } from './MER1Renderer';

export {
    renderAnnexD,
    renderAnnexG,
    renderAnnexH,
    renderAnnexM,
    renderSummary,
    renderGenericAnnex,
    renderMER1
};

/**
 * Main render function that routes to the appropriate renderer based on annex type
 * @param {string} annex - The annex identifier (A-O, SUMMARY, MER1, etc.)
 * @param {object} data - The data to render
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered content
 */
export function renderBatchContent(annex, data, isDark) {
    // Handle SUMMARY first
    if (annex === 'SUMMARY') return renderSummary(data);
    
    // Handle MER1
    if (annex === 'MER1') return renderMER1(data, isDark);
    
    // Handle special annex types with custom renderers
    if (annex === 'D') return renderAnnexD(data, isDark);
    if (annex === 'G') return renderAnnexG(data, isDark);
    if (annex === 'H') return renderAnnexH(data, isDark);
    if (annex === 'M') return renderAnnexM(data, isDark);

    // Use generic renderer for standard annexes (A-O)
    return renderGenericAnnex(annex, data, isDark);
}
