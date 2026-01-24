/**
 * Central export for all annex renderers
 * Simplifies imports and provides a single source of truth for rendering logic
 */
import { renderAnnexD, renderAnnexG, renderAnnexH, renderAnnexM, renderSummary } from '../AnnexRenderers';
import { renderGenericAnnex } from './GenericRenderer';

export {
    renderAnnexD,
    renderAnnexG,
    renderAnnexH,
    renderAnnexM,
    renderSummary,
    renderGenericAnnex
};

/**
 * Main render function that routes to the appropriate renderer based on annex type
 * @param {string} annex - The annex identifier (A-O, SUMMARY)
 * @param {object} data - The data to render
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered content
 */
export function renderBatchContent(annex, data, isDark) {
    // Handle SUMMARY first
    if (annex === 'SUMMARY') return renderSummary(data);
    
    // Handle special annex types with custom renderers
    if (annex === 'D') return renderAnnexD(data, isDark);
    if (annex === 'G') return renderAnnexG(data, isDark);
    if (annex === 'H') return renderAnnexH(data, isDark);
    if (annex === 'M') return renderAnnexM(data, isDark);

    // Use generic renderer for standard annexes (A-O)
    return renderGenericAnnex(annex, data, isDark);
}
