import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Category key constants ────────────────────────────────────────────────────
export const CAREER_JOB_CATEGORY_KEYS = [
  'labor_empowerment',
  'job_fairs',
  'phil_job_net',
  'career_counseling',
];

export const CAREER_JOB_CATEGORY_LABELS = {
  labor_empowerment: 'Labor Empowerment and Career Guidance Conference for All Graduating Students (per RA 11551)',
  job_fairs:         'Job Fairs in Coordination with DOLE Regional Offices and PESOs',
  phil_job_net:      'Registration of Graduating Students in PhilJobNet Portal',
  career_counseling: 'Career Vocational and Employment Counseling',
  others:            'Others (please specify)',
  total:             'All Activities (Total)',
};

// ─── Shared cell renderers ────────────────────────────────────────────────────

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

function StudentCell({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  return <span className="font-medium">{value.toLocaleString()}</span>;
}

function categoryColumnGroup(headerName, fieldPrefix, onActivityClick) {
  return {
    headerName,
    children: [
      {
        headerName: 'No. of Activities Conducted',
        field: `${fieldPrefix}_activities`,
        width: 130,
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
        headerName: 'No. of Students Participated',
        field: `${fieldPrefix}_students`,
        width: 140,
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'center' },
        cellRenderer: (params) => <StudentCell value={params.value} />,
      },
    ],
  };
}

// ─── Section config ───────────────────────────────────────────────────────────

export const careerJobConfig = {
  sectionId:    '4-CareerJob',
  sectionTitle: 'Career and Job Placement Services',

  getColumns: (onActivityClick = null) => [
    // ── HEI Name (pinned) ──────────────────────────────────────────────────
    {
      headerName: 'Name of HEI',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },

    // ── 4 service type categories ──────────────────────────────────────────
    categoryColumnGroup(
      'Labor Empowerment and Career Guidance Conference for All Graduating Students (per RA 11551)',
      'labor_empowerment',
      onActivityClick,
    ),
    categoryColumnGroup(
      'Job Fairs in Coordination with DOLE Regional Offices and PESOs',
      'job_fairs',
      onActivityClick,
    ),
    categoryColumnGroup(
      'Registration of Graduating Students in PhilJobNet Portal',
      'phil_job_net',
      onActivityClick,
    ),
    categoryColumnGroup(
      'Career Vocational and Employment Counseling',
      'career_counseling',
      onActivityClick,
    ),

    // ── Others (yellow) ────────────────────────────────────────────────────
    {
      headerName: 'Others (please specify)',
      children: [
        {
          headerName: 'Name of Services/Activities',
          field: 'others_titles',
          width: 220,
          filter: 'agTextColumnFilter',
          cellRenderer: (params) => {
            if (!params.value) return <span className="text-gray-400">—</span>;
            return (
              <span className="text-sm text-yellow-700 dark:text-yellow-300" title={params.value}>
                {params.value.length > 40 ? `${params.value.substring(0, 40)}…` : params.value}
              </span>
            );
          },
        },
        {
          headerName: 'No. of Activities Conducted',
          field: 'others_activities',
          width: 130,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => (
            <ActivityCell
              value={params.value}
              yellow={true}
              onClick={() =>
                onActivityClick?.('others', params.data.hei_id, params.data.hei_name, params.value)
              }
            />
          ),
        },
        {
          headerName: 'No. of Students Participated',
          field: 'others_students',
          width: 140,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => <StudentCell value={params.value} />,
        },
      ],
    },

    // ── Total ──────────────────────────────────────────────────────────────
    {
      headerName: 'Total',
      children: [
        {
          headerName: 'No. of Activities',
          field: 'total_activities',
          width: 120,
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
          headerName: 'No. of Students',
          field: 'total_students',
          width: 120,
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

    // ── Status ─────────────────────────────────────────────────────────────
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
