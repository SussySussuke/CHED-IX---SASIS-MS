import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Category key constants ────────────────────────────────────────────────────
export const INFO_ORIENTATION_CATEGORY_KEYS = [
  'campus_orientation',
  'gender_sensitivity',
  'anti_hazing',
  'substance_abuse',
  'sexual_health',
  'mental_health',
  'disaster_risk',
];

export const INFO_ORIENTATION_CATEGORY_LABELS = {
  campus_orientation:  'Campus Orientation',
  gender_sensitivity:  'Gender-Sensitivity / VAWC',
  anti_hazing:         'Anti-Hazing',
  substance_abuse:     'Substance-Abuse Campaigns',
  sexual_health:       'Sexual / Reproductive Health',
  mental_health:       'Mental Health / Wellness',
  disaster_risk:       'Disaster Risk Management',
  uncategorized:       'Miscellaneous / Uncategorized',
  total:               'All Activities (Total)',
};

// ─── Shared cell renderers ────────────────────────────────────────────────────

/**
 * Clickable activity count cell.
 * - Non-zero: full colour, shows count + arrow
 * - Zero: dimmed, shows "0 +" to hint you can open and assign records into this category
 * Pass yellow=true for the Miscellaneous column.
 */
function ActivityCell({ value, onClick, yellow = false }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;

  if (value === 0) {
    return (
      <button
        className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400
                   focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                   rounded px-1.5 py-0.5 transition-all text-sm"
        onClick={onClick}
        title="No records yet — click to view all records for this HEI and assign some here"
      >
        0 +
      </button>
    );
  }

  const colour = yellow
    ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 focus:ring-yellow-500'
    : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:ring-blue-500';

  return (
    <button
      className={`font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-1.5 py-0.5 transition-all ${colour}`}
      onClick={onClick}
      title="Click to view details"
    >
      {value} →
    </button>
  );
}

/** Formatted student count cell */
function StudentCell({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  return <span className="font-medium">{value.toLocaleString()}</span>;
}

/** Builds a standard category column group (Activities + Students) */
function categoryColumnGroup(headerName, fieldPrefix, onActivityClick) {
  return {
    headerName,
    children: [
      {
        headerName: 'Activities',
        field: `${fieldPrefix}_activities`,
        width: 100,
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => (
          <ActivityCell
            value={params.value}
            onClick={() =>
              onActivityClick?.(fieldPrefix, params.data.hei_id, params.data.hei_name, params.value)
            }
          />
        ),
      },
      {
        headerName: 'Students',
        field: `${fieldPrefix}_students`,
        width: 100,
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => <StudentCell value={params.value} />,
      },
    ],
  };
}

// ─── Section config ───────────────────────────────────────────────────────────

/**
 * 2-Info-Orientation Section Configuration
 * Information and Orientation Services & Activities (Annex A + B)
 *
 * getColumns(onActivityClick):
 *   onActivityClick(category, heiId, heiName, count) — fired when a count cell
 *   is clicked. 'category' is one of INFO_ORIENTATION_CATEGORY_KEYS, 'uncategorized',
 *   or 'total'.
 */
export const infoOrientationConfig = {
  sectionId: '2-Info-Orientation',
  sectionTitle: 'Information & Orientation Services',

  getColumns: (onActivityClick = null) => [
    // ── HEI Name (pinned) ──────────────────────────────────────────────────
    {
      headerName: 'HEI Name',
      field: 'hei_name',
      flex: 1,
      minWidth: 280,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellStyle: { fontWeight: '500' },
    },

    // ── 7 keyword-matched categories ───────────────────────────────────────
    categoryColumnGroup('Campus Orientation',          'campus_orientation', onActivityClick),
    categoryColumnGroup('Gender-Sensitivity / VAWC',   'gender_sensitivity', onActivityClick),
    categoryColumnGroup('Anti-Hazing',                 'anti_hazing',        onActivityClick),
    categoryColumnGroup('Substance-Abuse Campaigns',   'substance_abuse',    onActivityClick),
    categoryColumnGroup('Sexual / Reproductive Health','sexual_health',       onActivityClick),
    categoryColumnGroup('Mental Health / Wellness',    'mental_health',      onActivityClick),
    categoryColumnGroup('Disaster Risk Management',    'disaster_risk',      onActivityClick),

    // ── Miscellaneous (yellow) ─────────────────────────────────────────────
    {
      headerName: 'Miscellaneous',
      children: [
        {
          headerName: 'Activities',
          field: 'uncategorized_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => (
            <ActivityCell
              value={params.value}
              yellow={true}
              onClick={() =>
                onActivityClick?.('uncategorized', params.data.hei_id, params.data.hei_name, params.value)
              }
            />
          ),
        },
        {
          headerName: 'Students',
          field: 'uncategorized_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => <StudentCell value={params.value} />,
        },
      ],
    },

    // ── Total (deduplicated) ───────────────────────────────────────────────
    {
      headerName: 'Total',
      children: [
        {
          headerName: 'Activities',
          field: 'total_activities',
          width: 110,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center', fontWeight: 'bold' },
          cellRenderer: (params) => (
            <ActivityCell
              value={params.value}
              onClick={() =>
                onActivityClick?.('total', params.data.hei_id, params.data.hei_name, params.value)
              }
            />
          ),
        },
        {
          headerName: 'Students',
          field: 'total_students',
          width: 110,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center', fontWeight: 'bold' },
          cellRenderer: (params) => {
            if (params.value === null || params.value === undefined)
              return <span className="text-gray-400">—</span>;
            return (
              <span className="font-bold text-gray-900 dark:text-white">
                {params.value.toLocaleString()}
              </span>
            );
          },
        },
      ],
    },

    // ── Name preview ───────────────────────────────────────────────────────
    {
      headerName: 'Name of Services / Activities',
      field: 'services_activities_list',
      width: 280,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <span className="text-sm" title={params.value}>
            {params.value.length > 50 ? `${params.value.substring(0, 50)}…` : params.value}
          </span>
        );
      },
    },

    // ── Status ─────────────────────────────────────────────────────────────
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params) => (
        <div className="flex justify-center">
          <StatusBadge status={params.value} />
        </div>
      ),
    },
  ],
};
