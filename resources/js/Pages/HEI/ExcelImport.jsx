import React, { useState, useRef } from 'react';
import HEILayout from '../../Layouts/HEILayout';
import { useTheme } from '../../Context/ThemeContext';
import ImportConflictModal from '../../Components/Submissions/ImportConflictModal';
import {
  IoCloudUpload,
  IoDownload,
  IoCheckmarkCircle,
  IoWarning,
  IoCloseCircle,
  IoInformationCircle,
  IoDocument,
} from 'react-icons/io5';

const SECTION = {
  idle:       'idle',
  uploading:  'uploading',
  review:     'review',
  confirming: 'confirming',
  done:       'done',
};

export default function ExcelImport({ availableYears, defaultYear }) {
  const { isDark } = useTheme();

  const [academicYear, setAcademicYear]   = useState(defaultYear);
  const [section, setSection]             = useState(SECTION.idle);
  const [parseResult, setParseResult]     = useState(null);  // { clean, conflicts, errors, skipped }
  const [conflictStep, setConflictStep]   = useState(0);     // index into conflicts[]
  const [approvedIds, setApprovedIds]     = useState([]);    // sheet IDs user approved to overwrite
  const [doneMessage, setDoneMessage]     = useState('');
  const [globalError, setGlobalError]     = useState('');
  const fileRef = useRef(null);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    window.location.href = `/hei/excel/export?academic_year=${encodeURIComponent(academicYear)}`;
  };

  // ── Import Step 1: upload & parse ───────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGlobalError('');
    setSection(SECTION.uploading);

    const form = new FormData();
    form.append('file', file);
    form.append('academic_year', academicYear);
    form.append('_token', document.querySelector('meta[name="csrf-token"]')?.content ?? '');

    try {
      const res  = await fetch('/hei/excel/import', { method: 'POST', body: form, credentials: 'same-origin' });
      const json = await res.json();

      if (!res.ok) {
        setGlobalError(json.message ?? 'Import failed. Please try again.');
        setSection(SECTION.idle);
        return;
      }

      setParseResult(json);
      setApprovedIds([]);
      setConflictStep(0);

      // If there are conflicts, open the modal. Otherwise go straight to review.
      setSection(SECTION.review);
    } catch {
      setGlobalError('Network error — could not reach the server.');
      setSection(SECTION.idle);
    } finally {
      // Reset file input so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Conflict modal callbacks ─────────────────────────────────────────────
  const handleConflictApprove = () => {
    const sheetId = parseResult.conflicts[conflictStep]?.sheetId;
    if (sheetId) setApprovedIds(prev => [...prev, sheetId]);
    advanceConflict();
  };

  const handleConflictSkip = () => {
    advanceConflict();
  };

  const advanceConflict = () => {
    if (conflictStep + 1 < parseResult.conflicts.length) {
      setConflictStep(c => c + 1);
    } else {
      // All conflicts resolved — conflicts modal closes automatically
      setConflictStep(0);
    }
  };

  const pendingConflict = parseResult?.conflicts?.length > 0 && conflictStep < parseResult.conflicts.length
    ? parseResult.conflicts[conflictStep]
    : null;

  // ── Import Step 2: confirm ───────────────────────────────────────────────
  const handleConfirm = async () => {
    setSection(SECTION.confirming);
    setGlobalError('');

    try {
      const res  = await fetch('/hei/excel/import/confirm', {
        method:      'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type':     'application/json',
          'X-CSRF-TOKEN':     document.querySelector('meta[name="csrf-token"]')?.content ?? '',
          'Accept':           'application/json',
        },
        body: JSON.stringify({ approved_sheet_ids: approvedIds }),
      });
      const json = await res.json();

      if (!res.ok) {
        setGlobalError(json.message ?? 'Confirm failed.');
        setSection(SECTION.review);
        return;
      }

      setDoneMessage(json.message);
      setSection(SECTION.done);
    } catch {
      setGlobalError('Network error during confirmation.');
      setSection(SECTION.review);
    }
  };

  const handleReset = () => {
    setSection(SECTION.idle);
    setParseResult(null);
    setApprovedIds([]);
    setConflictStep(0);
    setDoneMessage('');
    setGlobalError('');
  };

  // ── helpers ──────────────────────────────────────────────────────────────
  const cleanCount    = parseResult?.clean?.length    ?? 0;
  const conflictCount = parseResult?.conflicts?.length ?? 0;
  const errorCount    = parseResult?.errors?.length    ?? 0;
  const skippedCount  = parseResult?.skipped?.length   ?? 0;

  // Conflicts that the user has already decided on
  const resolvedCount = conflictStep === 0 && section !== SECTION.review
    ? parseResult?.conflicts?.length ?? 0
    : conflictStep;

  const allConflictsResolved = resolvedCount >= conflictCount;

  const card = `rounded-lg border p-6 ${isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200 shadow-sm'}`;

  return (
    <HEILayout title="Import / Export">
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Import / Export</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Download a pre-filled Excel template or upload one to import your data.
          </p>
        </div>

        {/* Academic Year selector */}
        <div className={card}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            className="w-56 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500"
          >
            {[...availableYears].reverse().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Export card */}
        <div className={card}>
          <div className="flex items-start gap-4">
            <IoDownload className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Template</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Downloads an Excel file pre-filled with your existing data for {academicYear}.
                Empty sheets are included so you can fill them in offline and re-import later.
                Signatures are not included.
              </p>
              <button
                onClick={handleExport}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
                           bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <IoDownload className="w-4 h-4" />
                Download Template ({academicYear})
              </button>
            </div>
          </div>
        </div>

        {/* Import card */}
        <div className={card}>
          <div className="flex items-start gap-4">
            <IoCloudUpload className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import from Excel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload a filled SAS template (.xlsx) to import your data into the system.
                Empty sheets are skipped. Sheets with existing data will prompt you to confirm before overwriting.
              </p>

              {globalError && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20
                                border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  <IoCloseCircle className="w-5 h-5 flex-shrink-0" />
                  {globalError}
                </div>
              )}

              {section === SECTION.idle && (
                <div className="mt-4">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium cursor-pointer
                               bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <IoCloudUpload className="w-4 h-4" />
                    Choose Excel File
                  </label>
                </div>
              )}

              {section === SECTION.uploading && (
                <div className="mt-4 flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                  Parsing your file…
                </div>
              )}

              {section === SECTION.done && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20
                                  border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{doneMessage}</span>
                  </div>
                  <button onClick={handleReset} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Import another file
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parse results — shown in review and confirming states */}
        {(section === SECTION.review || section === SECTION.confirming) && parseResult && (
          <div className="space-y-4">

            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryBadge icon={<IoCheckmarkCircle />} color="green"  label="Ready"    count={cleanCount} />
              <SummaryBadge icon={<IoWarning />}         color="yellow" label="Conflicts" count={conflictCount} />
              <SummaryBadge icon={<IoCloseCircle />}     color="red"    label="Errors"   count={errorCount} />
              <SummaryBadge icon={<IoDocument />}        color="gray"   label="Skipped"  count={skippedCount} />
            </div>

            {/* Errors — shown first so user knows before confirming */}
            {errorCount > 0 && (
              <div className={card}>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <IoCloseCircle className="w-5 h-5" /> Sheets with Errors (not imported)
                </h3>
                <div className="space-y-3">
                  {parseResult.errors.map(sheet => (
                    <div key={sheet.sheetId} className="text-sm">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{sheet.label}</p>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-red-600 dark:text-red-400">
                        {sheet.errors.slice(0, 5).map((e, i) => (
                          <li key={i}>Row {e.row} — {e.field}: {e.message}</li>
                        ))}
                        {sheet.errors.length > 5 && (
                          <li className="text-gray-500">…and {sheet.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clean sheets */}
            {cleanCount > 0 && (
              <div className={card}>
                <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                  <IoCheckmarkCircle className="w-5 h-5" /> Ready to Import
                </h3>
                <ul className="space-y-1">
                  {parseResult.clean.map(s => (
                    <li key={s.sheetId} className="flex items-center justify-between text-sm
                                                    text-gray-800 dark:text-gray-200">
                      <span>{s.label}</span>
                      <span className="text-gray-500 dark:text-gray-400">{s.rowCount} row{s.rowCount !== 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conflicts — status of each */}
            {conflictCount > 0 && (
              <div className={card}>
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                  <IoWarning className="w-5 h-5" /> Conflicts
                </h3>
                <ul className="space-y-1.5">
                  {parseResult.conflicts.map((c, i) => {
                    const approved = approvedIds.includes(c.sheetId);
                    const pending  = i === conflictStep && pendingConflict;
                    const resolved = i < conflictStep || (i === conflictStep && !pendingConflict);

                    return (
                      <li key={c.sheetId} className="flex items-center justify-between text-sm">
                        <span className="text-gray-800 dark:text-gray-200">{c.label}</span>
                        {pending ? (
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">Waiting for decision…</span>
                        ) : resolved ? (
                          <span className={`font-medium ${approved
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'}`}>
                            {approved ? 'Will overwrite' : 'Skipped'}
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Step-through prompt if there are still unresolved conflicts */}
                {pendingConflict && (
                  <div className="mt-4 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700
                                  bg-yellow-50 dark:bg-yellow-900/20 text-sm
                                  text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <IoInformationCircle className="w-5 h-5 flex-shrink-0" />
                    Use the comparison panel above to resolve this conflict.
                  </div>
                )}
              </div>
            )}

            {/* Confirm button — active once all conflicts resolved */}
            {allConflictsResolved && (cleanCount > 0 || approvedIds.length > 0) && (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleConfirm}
                  disabled={section === SECTION.confirming}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors text-white
                    ${section === SECTION.confirming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {section === SECTION.confirming
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving…</>
                    : <><IoCheckmarkCircle className="w-4 h-4" /> Confirm Import</>
                  }
                </button>
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Cancel
                </button>
              </div>
            )}

            {/* Nothing to import edge case */}
            {allConflictsResolved && cleanCount === 0 && approvedIds.length === 0 && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nothing to import — all sheets were either skipped, had errors, or conflicts were not approved.
                </p>
                <button onClick={handleReset} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conflict modal — steps through conflicts one at a time */}
      {pendingConflict && (
        <ImportConflictModal
          conflict={pendingConflict}
          step={conflictStep + 1}
          total={conflictCount}
          isDark={isDark}
          onApprove={handleConflictApprove}
          onSkip={handleConflictSkip}
        />
      )}
    </HEILayout>
  );
}

// ── small sub-components ───────────────────────────────────────────────────

function SummaryBadge({ icon, color, label, count }) {
  const colors = {
    green:  'bg-green-50  dark:bg-green-900/20  text-green-700  dark:text-green-300  border-green-200  dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    red:    'bg-red-50    dark:bg-red-900/20    text-red-700    dark:text-red-300    border-red-200    dark:border-red-800',
    gray:   'bg-gray-50   dark:bg-gray-900/20   text-gray-600   dark:text-gray-400   border-gray-200   dark:border-gray-700',
  };

  return (
    <div className={`rounded-lg border p-3 flex items-center gap-3 ${colors[color]}`}>
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}
