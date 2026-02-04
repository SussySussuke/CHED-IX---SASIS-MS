/**
 * Central export for all renderers
 * Routes to the appropriate renderer based on annex type
 */
import React from 'react';
import { renderAnnexH, renderAnnexM } from '../AnnexRenderers';
import { renderSharedContent } from './SharedRenderer';
import { usesSharedRenderer } from '../../../Config/sharedRendererConfig';

// Export custom renderers for direct use if needed (only H and M remain)
export {
  renderAnnexH,
  renderAnnexM,
  renderSharedContent
};

/**
 * Main render function that routes to the appropriate renderer based on annex type
 * 
 * RENDERING STRATEGY:
 * - Custom renderers: H, M (complex/unique structures with special requirements)
 * - SharedRenderer: ALL OTHER FORMS including:
 *   * Standard annexes: A, B, C, C-1, E, F, I, I-1, J, K, L, L-1, N, N-1, O
 *   * MER forms: MER1, MER2, MER3
 *   * Special forms: SUMMARY, D, G
 * 
 * @param {string} annex - The annex identifier (A-O, SUMMARY, MER1-3, etc.)
 * @param {object} data - The data to render
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {JSX.Element} The rendered content
 */
export function renderBatchContent(annex, data, isDark) {
  // Handle forms with custom renderers (only H and M remain)
  if (annex === 'H') return renderAnnexH(data, isDark);
  if (annex === 'M') return renderAnnexM(data, isDark);

  // All other forms use the SharedRenderer
  if (usesSharedRenderer(annex)) {
    return renderSharedContent(annex, data, isDark);
  }

  // Fallback for unknown annex types
  return (
    <p className="text-gray-500 dark:text-gray-400">
      No renderer available for {annex}
    </p>
  );
}
