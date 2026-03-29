import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { IoClose, IoRefresh, IoCheckmark, IoListOutline, IoArrowBack } from 'react-icons/io5';
import AGGridViewer from '../Common/AGGridViewer';
import SearchableSelect from '../Form/SearchableSelect';

const RecordsModal = ({
  isOpen,
  onClose,
  onRecategorized,

  title = '',
  subtitle = '',
  categoryLabel = '',
  isMiscellaneous = false,
  isTotal = false,

  fetchUrl,
  totalFetchUrl = null,
  recategorizeUrl = null,

  columnDefs = [],
  categoryOptions = [],

  recordTypeField = 'record_type',
  recordIdField = 'id',
}) => {
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [viewingAll, setViewingAll] = useState(false);

  // Per-row state: { [rowKey]: { saving, selected: string[], saved, error } }
  const [rowStates, setRowStates] = useState({});

  const canRecategorize = !!recategorizeUrl;
  // The URL actually used for fetching — switches when viewingAll is toggled
  const activeFetchUrl = viewingAll && totalFetchUrl ? totalFetchUrl : fetchUrl;

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    if (!activeFetchUrl) return;
    setLoading(true);
    setError(null);
    setRowStates({});

    try {
      const res = await fetch(activeFetchUrl);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setRecords(data.records ?? data.programs ?? []);
    } catch (err) {
      setError(err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [activeFetchUrl]);

  useEffect(() => {
    if (isOpen) fetchRecords();
    else {
      setRecords([]);
      setError(null);
      setRowStates({});
      setViewingAll(false);
    }
  }, [isOpen, fetchRecords]);

  // ── Recategorize ─────────────────────────────────────────────────────────

  const handleSave = async (record, selectedCategories) => {
    const rowKey = `${record[recordTypeField]}_${record[recordIdField]}`;

    setRowStates(prev => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], saving: true, error: null },
    }));

    try {
      // Use axios (pre-configured by Inertia/Laravel with CSRF + credentials) instead of
      // raw fetch() to avoid 419 Session Expired from Laravel's CSRF middleware.
      const response = await axios.patch(recategorizeUrl, {
        record_type: record[recordTypeField],
        record_id:   record[recordIdField],
        categories:  selectedCategories.length > 0 ? selectedCategories : null,
      });

      const res = { ok: response.status >= 200 && response.status < 300, status: response.status };

      if (!res.ok) {
        throw new Error(response.data?.message ?? `Server error: ${response.status}`);
      }

      setRowStates(prev => ({
        ...prev,
        [rowKey]: { saving: false, selected: selectedCategories, saved: true, error: null },
      }));

      onRecategorized?.();

      // In misc mode (and not viewing all), refresh so moved rows disappear
      if (isMiscellaneous && !viewingAll) await fetchRecords();

    } catch (err) {
      setRowStates(prev => ({
        ...prev,
        [rowKey]: { ...prev[rowKey], saving: false, error: err.message },
      }));
    }
  };

  // ── Multi-checkbox cell renderer ──────────────────────────────────────────

  const RESET_VALUE = '__reset__';

  // Build select options: reset sentinel first, then real categories
  const selectOptions = React.useMemo(() => [
    { value: RESET_VALUE, label: '— Reset to keyword matching' },
    ...categoryOptions,
  ], [categoryOptions]);

  const MultiCategoryCell = ({ record, rowKey, currentAssigned }) => {
    const state = rowStates[rowKey] ?? {};

    // Use only the first valid assigned category (single-select going forward)
    const validAssigned = (currentAssigned ?? []).filter(
      c => categoryOptions.some(o => o.value === c)
    );
    const initialValue = validAssigned[0] ?? RESET_VALUE;

    const [selected, setSelected] = useState(initialValue);

    // Re-sync when a fresh fetch resets rowStates
    useEffect(() => {
      if (!state.saved) {
        setSelected(initialValue);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowStates]);

    if (state.saved) {
      const savedVal = state.selected?.[0];
      const label = savedVal
        ? (categoryOptions.find(o => o.value === savedVal)?.label ?? savedVal)
        : 'Reset to keyword matching';
      return (
        <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 py-1">
          <IoCheckmark className="w-3.5 h-3.5 flex-shrink-0" />
          {label}
        </span>
      );
    }

    const isDirty = selected !== initialValue;

    const handleChange = (value) => {
      setSelected(value);
    };

    // Derive the array to send: empty = reset, otherwise single-element
    const categoriesToSave = selected === RESET_VALUE ? [] : [selected];

    return (
      <div className="py-1.5 space-y-1">
        <SearchableSelect
          value={selected}
          onChange={handleChange}
          options={selectOptions}
          placeholder="Select category..."
          disabled={state.saving}
          usePortal
        />

        {isDirty && (
          <div className="flex items-center gap-2 pt-0.5">
            <button
              disabled={state.saving}
              onClick={() => handleSave(record, categoriesToSave)}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded
                         bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
            >
              {state.saving
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                : <IoCheckmark className="w-3 h-3" />}
              Save
            </button>
          </div>
        )}

        {state.error && (
          <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>
    );
  };

  // ── Column defs (append action column when recategorize is on) ────────────

  const gridColumns = React.useMemo(() => {
    if (!canRecategorize || categoryOptions.length === 0) return columnDefs;

    const actionCol = {
      headerName: 'Assign Categories',
      field:      '__action',
      minWidth:   340,
      flex:       1,
      sortable:   false,
      filter:     false,
      resizable:  true,
      pinned:     'right',
      autoHeight: true,
      wrapText:   false,
      cellRenderer: (params) => {
        const record  = params.data;
        const rowKey  = `${record[recordTypeField]}_${record[recordIdField]}`;
        return (
          <MultiCategoryCell
            record={record}
            rowKey={rowKey}
            currentAssigned={record.assigned_categories}
          />
        );
      },
    };

    return [...columnDefs, actionCol];
  // rowStates triggers re-render of saved/saving cells
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnDefs, canRecategorize, categoryOptions, rowStates]);

  // ── Accent colours ────────────────────────────────────────────────────────

  const accentBg    = isMiscellaneous
    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  const accentText  = isMiscellaneous
    ? 'text-yellow-800 dark:text-yellow-200'
    : 'text-blue-800 dark:text-blue-200';
  const accentBadge = isMiscellaneous
    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl
                          max-w-7xl w-full border border-gray-200 dark:border-gray-700">

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  {categoryLabel && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${accentBadge}`}>
                      {categoryLabel}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {/* View All / Back to Category toggle */}
                {totalFetchUrl && (
                  <button
                    onClick={() => setViewingAll(v => !v)}
                    title={viewingAll ? 'Back to category view' : 'View all records for this HEI'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                               border transition-colors ${
                      viewingAll
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {viewingAll
                      ? <><IoArrowBack className="w-3.5 h-3.5" /> Back to Category</>
                      : <><IoListOutline className="w-3.5 h-3.5" /> View All Records</>}
                  </button>
                )}
                <button
                  onClick={fetchRecords}
                  title="Refresh"
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoRefresh className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                             rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info banner */}
            {canRecategorize && (
              <div className={`px-5 py-3 border-b ${accentBg}`}>
                <p className={`text-sm ${accentText}`}>
                  {isMiscellaneous
                    ? 'These activities did not match any keyword category. Select a category from the dropdown in the "Assign Categories" column, then click Save.'
                    : 'Select a category from the dropdown in the "Assign Categories" column to override keyword matching. Choose "Reset" to revert to automatic matching.'}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Loading records…</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                                rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
                  Error: {error}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No records found.
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">{records.length}</span>
                    {' '}record{records.length !== 1 ? 's' : ''}
                  </p>
                  <AGGridViewer
                    rowData={records}
                    columnDefs={gridColumns}
                    height="500px"
                    paginationPageSize={25}
                    enableQuickFilter={true}
                    quickFilterPlaceholder="Search records…"
                    gridOptions={{
                      rowHeight: undefined,
                      getRowHeight: (params) => {
                        if (canRecategorize) return 80;
                        const cats = params.data?.assigned_categories;
                        if (!cats || cats.length <= 1) return 40;
                        return cats.length * 28 + 12;
                      },
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm
                           rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecordsModal;
