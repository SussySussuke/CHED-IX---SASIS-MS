import StatusBadge from '../../Components/Widgets/StatusBadge';

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
      title="Click to view program details"
    >
      {value} →
    </button>
  );
}

// ─── Section config ───────────────────────────────────────────────────────────

export const socialCommunityConfig = {
  sectionId:    '8-SocialCommunity',
  sectionTitle: 'Social Community Involvement',

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
            onActivityClick?.(params.data.hei_id, params.data.hei_name, params.value)
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
              onActivityClick?.(params.data.hei_id, params.data.hei_name, params.data.total_activities)
            }
            title="Click to view program details"
          >
            {params.value.toLocaleString()}
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
