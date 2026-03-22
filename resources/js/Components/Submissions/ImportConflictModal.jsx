import React from 'react';
import { IoWarning, IoCheckmarkCircle, IoArrowForward, IoClose } from 'react-icons/io5';

/**
 * ImportConflictModal
 *
 * Steps through conflicts one at a time.
 * Shows a simple summary of existing vs incoming — not a full field diff.
 * User either approves (overwrite) or skips (keep existing) per conflict.
 */
export default function ImportConflictModal({ conflict, step, total, isDark, onApprove, onSkip }) {
  if (!conflict) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">

        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onSkip} />

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
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Skip (keep existing)"
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
              {/* Existing */}
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

              {/* Arrow */}
              <div className="hidden col-span-0" /> {/* spacer not needed, grid handles it */}

              {/* Incoming */}
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
  );
}
