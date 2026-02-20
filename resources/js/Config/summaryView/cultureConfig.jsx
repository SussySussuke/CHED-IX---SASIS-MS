import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Drilldown columns (for RecordsModal) ────────────────────────────────────
export const CULTURE_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title of Activity',
    field: 'title_of_activity',
    flex: 2,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Date',
    field: 'implementation_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'Venue',
    field: 'implementation_venue',
    flex: 1,
    minWidth: 150,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Total Participants',
    field: 'total_participants',
    width: 140,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    width: 180,
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
export const CULTURE_TIP = 'Culture and the arts data from Annex N. Click any count to view individual activity records. — = HEI has not submitted.';

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
      title="Click to view activity details"
    >
      {value} →
    </button>
  );
}

// ─── Section config ───────────────────────────────────────────────────────────
export const cultureConfig = {
  sectionId:    '10-Culture',
  sectionTitle: 'Culture and the Arts',

  getColumns: (onActivityClick = null) => [
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
      headerName: 'Total No. of Activities Conducted',
      field:      'total_activities',
      width:      210,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => (
        <CountCell
          value={params.value}
          onClick={() =>
            onActivityClick?.(params.data.hei_id, params.data.hei_name)
          }
        />
      ),
    },
    {
      headerName: 'Total No. of Participants',
      field:      'total_participants',
      width:      190,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <button
            className="font-semibold text-blue-600 dark:text-blue-400
                       hover:text-blue-800 dark:hover:text-blue-200
                       hover:underline focus:outline-none focus:ring-2
                       focus:ring-offset-1 focus:ring-blue-500 rounded
                       px-1.5 py-0.5 transition-all"
            onClick={() =>
              onActivityClick?.(params.data.hei_id, params.data.hei_name)
            }
            title="Click to view activity details"
          >
            {params.value.toLocaleString()} →
          </button>
        );
      },
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
