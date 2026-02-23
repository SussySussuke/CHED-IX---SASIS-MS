import React, { useState, useRef, useEffect } from 'react';
import { IoCalendar, IoChevronDown, IoClose, IoCheckmark } from 'react-icons/io5';

/**
 * YearMultiSelect
 *
 * A compact multi-select dropdown for picking academic years.
 * - Shows selected years as removable pill tags
 * - Dropdown lists all available years with checkboxes
 * - "Select All" / "Clear All" shortcuts
 * - Works with any string[] of academic year labels (e.g. "2023-2024")
 *
 * Props:
 *   availableYears  string[]   — all years to choose from
 *   selectedYears   string[]   — currently selected years (controlled)
 *   onChange        (years: string[]) => void
 *   disabled        boolean
 */
const YearMultiSelect = ({
  availableYears = [],
  selectedYears  = [],
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (year) => {
    if (selectedYears.includes(year)) {
      onChange(selectedYears.filter((y) => y !== year));
    } else {
      // Keep insertion order = availableYears order (oldest → newest)
      const next = availableYears.filter(
        (y) => y === year || selectedYears.includes(y)
      );
      onChange(next);
    }
  };

  const selectAll  = () => onChange([...availableYears]);
  const clearAll   = () => onChange([]);

  const pillColors = [
    'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700',
    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700',
    'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
    'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700',
  ];

  // Stable color per year (index in availableYears)
  const colorFor = (year) => {
    const idx = availableYears.indexOf(year);
    return pillColors[idx % pillColors.length];
  };

  return (
    <div className="space-y-2" ref={ref}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <IoCalendar className="text-xl text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Academic Year(s)
        </span>
        {selectedYears.length > 1 && (
          <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">
            Comparing {selectedYears.length} years
          </span>
        )}
      </div>

      {/* Trigger / pill container */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          'w-full min-h-[42px] px-3 py-2 border-2 rounded-lg text-left',
          'bg-white dark:bg-gray-700',
          'border-blue-300 dark:border-blue-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'flex items-center flex-wrap gap-1.5',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400',
        ].join(' ')}
      >
        {selectedYears.length === 0 ? (
          <span className="text-sm text-gray-400 dark:text-gray-500 flex-1">
            Select academic year(s)…
          </span>
        ) : (
          selectedYears.map((year) => (
            <span
              key={year}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colorFor(year)}`}
            >
              {year}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(year); }}
                  className="hover:opacity-70 transition-opacity focus:outline-none"
                  aria-label={`Remove ${year}`}
                >
                  <IoClose className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}

        <IoChevronDown
          className={[
            'w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform duration-150',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-64 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden">
          {/* Actions bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              Select All
            </button>
            <span className="text-xs text-gray-400">
              {selectedYears.length}/{availableYears.length} selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:underline focus:outline-none"
            >
              Clear
            </button>
          </div>

          {/* Year options */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {availableYears.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">No years available</li>
            )}
            {availableYears.map((year) => {
              const checked = selectedYears.includes(year);
              return (
                <li key={year}>
                  <button
                    type="button"
                    onClick={() => toggle(year)}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                      checked
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    ].join(' ')}
                  >
                    {/* Checkbox indicator */}
                    <span
                      className={[
                        'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border',
                        checked
                          ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                          : 'border-gray-300 dark:border-gray-500',
                      ].join(' ')}
                    >
                      {checked && <IoCheckmark className="w-2.5 h-2.5 text-white" />}
                    </span>

                    <span className="flex-1">{year}</span>

                    {/* Color dot matching pill */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorFor(year).split(' ')[0].replace('bg-', 'bg-')}`}
                      style={{ opacity: 0.7 }}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {selectedYears.length <= 1
          ? 'Select one year to view, or multiple to compare side-by-side'
          : `Showing ${selectedYears.length} years side-by-side with trend deltas (Δ)`}
      </p>
    </div>
  );
};

export default YearMultiSelect;
