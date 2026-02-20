import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Drilldown columns (for RecordsModal) ────────────────────────────────────
export const DORM_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Housing / Facility Name',
    field: 'housing_name',
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Complete Address',
    field: 'complete_address',
    flex: 1,
    minWidth: 200,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'House Manager',
    field: 'house_manager_name',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Type',
    field: 'type',
    width: 130,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Remarks',
    field: 'remarks',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Section tip text ─────────────────────────────────────────────────────────
export const DORM_TIP = 'Student housing data from Annex L. Male/Female/Co-ed counts reflect exclusive type only (Co-ed includes facilities marked co-ed regardless of other flags). Click any count to view individual facility records. — = HEI has not submitted.';

// ─── Shared cell renderer ─────────────────────────────────────────────────────

function CountCell({ value, onClick }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  if (value === 0) {
    return (
      <button
        className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400
                   focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                   rounded px-1.5 py-0.5 transition-all text-sm"
        onClick={onClick}
        title="No records yet — click to view"
      >
        0 +
      </button>
    );
  }

  return (
    <button
      className="font-semibold text-blue-600 dark:text-blue-400
                 hover:text-blue-800 dark:hover:text-blue-200
                 hover:underline focus:outline-none focus:ring-2
                 focus:ring-offset-1 focus:ring-blue-500 rounded
                 px-1.5 py-0.5 transition-all"
      onClick={onClick}
      title="Click to view housing details"
    >
      {value} →
    </button>
  );
}

function NumericCell({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  return <span className="font-medium">{value}</span>;
}

// ─── Section config ───────────────────────────────────────────────────────────
export const dormConfig = {
  sectionId:    '13-Dorm',
  sectionTitle: 'Student Housing / Dormitory',

  getColumns: (onDormClick = null) => [
    {
      headerName: 'Name of Higher Education Institution',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },
    {
      headerName: 'Total No. of Registered Housing / Residential / Dorm',
      field:      'total_housing',
      width:      230,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => (
        <CountCell
          value={params.value}
          onClick={() => onDormClick?.(params.data.hei_id, params.data.hei_name)}
        />
      ),
    },
    {
      headerName: 'Male-Only',
      field:      'male_count',
      width:      120,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => <NumericCell value={params.value} />,
    },
    {
      headerName: 'Female-Only',
      field:      'female_count',
      width:      120,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => <NumericCell value={params.value} />,
    },
    {
      headerName: 'Co-ed',
      field:      'coed_count',
      width:      100,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => <NumericCell value={params.value} />,
    },
    {
      headerName: 'Status',
      field:      'status',
      width:      140,
      filter:     'agTextColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => (
        <div className="flex justify-center">
          <StatusBadge status={params.value} />
        </div>
      ),
    },
  ],
};
