import React, { useState } from 'react';
import { IoWarning, IoCheckmarkCircle, IoArrowForward, IoClose, IoEye } from 'react-icons/io5';
import CompareModal from './CompareModal';
import ConfirmationModal from '../Common/ConfirmationModal';

/**
 * ImportConflictModal
 *
 * Steps through conflicts one at a time.
 * Shows a summary of existing vs incoming with an option to open a full
 * side-by-side CompareModal so the user can see exactly what they're overwriting.
 * X button / backdrop asks for confirmation before cancelling the entire import.
 */
export default function ImportConflictModal({ conflict, step, total, isDark, onApprove, onSkip, onCancel }) {
  const [showCompare, setShowCompare]       = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!conflict) return null;

  // Derive the short annex letter/code from sheetId (e.g. ANNEX_C1 → C-1, ANNEX_A → A)
  const annexCode = conflict.sheetId
    .replace(/^ANNEX_/, '')
    .replace('C1', 'C-1')
    .replace('I1', 'I-1')
    .replace('L1', 'L-1')
    .replace('N1', 'N-1');

  // Shape data for CompareModal — no API fetch needed, data already in conflict payload
  const compareModalData = conflict.existingData && conflict.incomingData ? {
    loading: false,
    oldBatch: {
      annex:         annexCode,
      academic_year: conflict.academicYear ?? '',
      data:          conflict.existingData,
    },
    newBatch: {
      annex:         annexCode,
      academic_year: conflict.academicYear ?? '',
      data:          conflict.incomingData,
    },
  } : null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">

          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCancelConfirm(true)} />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">

            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                  <IoWarning className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Conflict {step} of {total}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {conflict.label}
                </h2>
              </div>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Cancel entire import"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This sheet already has data in the system. What do you want to do?
              </p>

              {/* Side-by-side summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4
                                bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                 text-gray-500 dark:text-gray-400 mb-2">
                    Current in System
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {conflict.existingSummary}
                  </p>
                </div>

                <div className="rounded-lg border border-yellow-200 dark:border-yellow-700 p-4
                                bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-xs font-semibold uppercase tracking-wide
                                text-yellow-600 dark:text-yellow-400 mb-2">
                    Incoming from Excel
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {conflict.rowCount} row{conflict.rowCount !== 1 ? 's' : ''} of new data
                  </p>
                </div>
              </div>

              {/* Full comparison button */}
              {compareModalData && (
                <button
                  onClick={() => setShowCompare(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                             text-sm font-medium border border-blue-300 dark:border-blue-600
                             text-blue-700 dark:text-blue-300
                             bg-blue-50 dark:bg-blue-900/20
                             hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <IoEye className="w-4 h-4" />
                  View full side-by-side comparison
                </button>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Approving will overwrite the current data entirely. Skipping will leave the existing data unchanged.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={onSkip}
                className="px-4 py-2 rounded-lg text-sm font-medium
                           bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Skip — keep existing
              </button>
              <button
                onClick={onApprove}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                           bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
              >
                <IoCheckmarkCircle className="w-4 h-4" />
                Overwrite with Excel data
                {total > 1 && step < total && (
                  <IoArrowForward className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>

            {/* Step indicator dots */}
            {total > 1 && (
              <div className="flex justify-center gap-1.5 pb-4">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      i + 1 === step
                        ? 'bg-yellow-500'
                        : i + 1 < step
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full comparison overlay — z-60 sits above the conflict modal (z-50) */}
      {showCompare && compareModalData && (
        <div className="relative z-60">
          <CompareModal
            compareModal={compareModalData}
            isDark={isDark}
            onClose={() => setShowCompare(false)}
            onApprove={() => {
              setShowCompare(false);
              onApprove();
            }}
          />
        </div>
      )}

      {/* Cancel confirmation — z-70 sits above everything */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => { setShowCancelConfirm(false); onCancel(); }}
        title="Cancel Import?"
        message="This will discard all conflict decisions made so far. Your existing data will not be changed. Are you sure?"
        confirmText="Yes, cancel import"
        cancelText="Keep going"
        variant="warning"
      />
    </>
  );
}
