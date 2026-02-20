import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Drilldown columns (for RecordsModal) ────────────────────────────────────
export const STUDENT_ORG_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Organization Name',
    field: 'name_of_accredited',
    flex: 1,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Years of Existence',
    field: 'years_of_existence',
    width: 130,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value ?? '—',
  },
  {
    headerName: 'Accredited/Recognized Since',
    field: 'accredited_since',
    width: 160,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Faculty Adviser',
    field: 'faculty_adviser',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'President/Head & Officers',
    field: 'president_and_officers',
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Specialization',
    field: 'specialization',
    width: 160,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Section tip text ─────────────────────────────────────────────────────────
export const STUDENT_ORG_TIP = 'Student organization data from Annex E. \'Activities Conducted\' = number of organizations that have listed programs/activities. Click any count to view organization details. — = HEI has not submitted.';

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
      title="Click to view organization details"
    >
      {value} →
    </button>
  );
}

// ─── Section config ───────────────────────────────────────────────────────────
export const studentOrganizationConfig = {
  sectionId:    '9-StudentOrganization',
  sectionTitle: 'Student Organizations',

  getColumns: (onOrgClick = null) => [
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
      headerName: 'Total No. of Accredited/Recognized/Authorized Student Orgs/Council/Government',
      field:      'total_organizations',
      width:      260,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => (
        <CountCell
          value={params.value}
          onClick={() =>
            onOrgClick?.(params.data.hei_id, params.data.hei_name)
          }
        />
      ),
    },
    {
      headerName: 'Total No. of Student Activities Conducted',
      field:      'total_with_activities',
      width:      230,
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
              onOrgClick?.(params.data.hei_id, params.data.hei_name)
            }
            title="Orgs that have recorded activities — click to view"
          >
            {params.value} →
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
