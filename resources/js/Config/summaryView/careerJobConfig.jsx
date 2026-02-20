import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Category key constants ───────────────────────────────────────────────────
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

// ─── Drilldown columns (for RecordsModal) ────────────────────────────────────
export const CAREER_JOB_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title of Program/Activity',
    field: 'title',
    flex: 2,
    minWidth: 250,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Venue',
    field: 'venue',
    flex: 1,
    minWidth: 150,
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
    headerName: 'Face-to-Face',
    field: 'participants_face_to_face',
    width: 120,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Online',
    field: 'participants_online',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Total',
    field: 'total_participants',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Category',
    field: 'assigned_categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: (params) => {
      const cats = params.value;
      if (!cats || cats.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cats.map((cat) => {
            const isOther = cat === 'others';
            return (
              <span
                key={cat}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isOther
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {CAREER_JOB_CATEGORY_LABELS[cat] ?? cat}
              </span>
            );
          })}
        </div>
      );
    },
  },
];

// ─── Recategorize options ─────────────────────────────────────────────────────
export const CAREER_JOB_RECATEGORIZE_OPTIONS = CAREER_JOB_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: CAREER_JOB_CATEGORY_LABELS[key],
}));

// ─── Section tip text ─────────────────────────────────────────────────────────
export const CAREER_JOB_TIP = 'Click any activity count to view program details from Annex C (Career and Job Placement Services). Yellow column shows activities that couldn\'t be automatically matched to a service type.';

// ─── Section config ───────────────────────────────────────────────────────────
export const careerJobConfig = {
  sectionId:    '4-CareerJob',
  sectionTitle: 'Career and Job Placement Services',

  getColumns: (onActivityClick = null) => [
    {
      headerName: 'Name of HEI',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },
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
