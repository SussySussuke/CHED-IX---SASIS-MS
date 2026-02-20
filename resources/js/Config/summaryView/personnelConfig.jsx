import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Category key constants ───────────────────────────────────────────────────
export const PERSONNEL_CATEGORY_KEYS = [
  'registered_guidance_counselors',
  'guidance_counseling',
  'career_guidance_placement',
  'registrars',
  'admission_personnel',
  'physician',
  'dentist',
  'nurse',
  'other_medical_health',
  'security_personnel',
  'food_service_personnel',
  'cultural_affairs',
  'sports_development',
  'student_discipline',
  'scholarship_personnel',
  'housing_residential',
  'pwd_special_needs',
  'student_governance',
  'student_publication',
  'multi_faith',
];

export const PERSONNEL_CATEGORY_LABELS = {
  registered_guidance_counselors: 'Registered Guidance Counselors',
  guidance_counseling:            'Guidance & Counseling Personnel',
  career_guidance_placement:      'Career Guidance / Placement Personnel',
  registrars:                     'Registrars',
  admission_personnel:            'Admission Personnel',
  physician:                      'Physician',
  dentist:                        'Dentist',
  nurse:                          'Nurse',
  other_medical_health:           'Other Medical / Health Workers',
  security_personnel:             'Security Personnel',
  food_service_personnel:         'Food Service Personnel',
  cultural_affairs:               'Cultural Affairs Personnel',
  sports_development:             'Sports Development Personnel',
  student_discipline:             'Student Discipline Personnel',
  scholarship_personnel:          'Scholarship Personnel',
  housing_residential:            'Housing / Residential / Dorm Personnel',
  pwd_special_needs:              'Personnel handling Students w/ Special Needs & PWDs',
  student_governance:             'Student Governance Personnel',
  student_publication:            'Student Publication Personnel',
  multi_faith:                    'Multi-faith Services Personnel',
  uncategorized:                  'Uncategorized / Other',
  total:                          'All Personnel (Total)',
};

// ─── Shared cell renderer ────────────────────────────────────────────────────

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
        title="No personnel yet — click to open and assign records into this category"
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
      title="Click to view personnel details"
    >
      {value} →
    </button>
  );
}

function categoryColumn(headerName, field, onCountClick) {
  return {
    headerName,
    field,
    width: 110,
    filter: 'agNumberColumnFilter',
    cellStyle: { textAlign: 'center' },
    cellRenderer: (params) => (
      <CountCell
        value={params.value}
        onClick={() =>
          onCountClick?.(field, params.data.hei_id, params.data.hei_name, params.value)
        }
      />
    ),
  };
}

// ─── Drilldown columns (for RecordsModal) ────────────────────────────────────
export const PERSONNEL_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Name',
    field: 'name_of_personnel',
    flex: 1,
    minWidth: 200,
    cellRenderer: (params) =>
      params.value
        ? <span className="font-medium">{params.value}</span>
        : <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Position / Designation',
    field: 'position_designation',
    flex: 1,
    minWidth: 220,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Office',
    field: 'office_type',
    width: 220,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Tenure / Appointment',
    field: 'tenure_nature_of_appointment',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Yrs in Office',
    field: 'years_in_office',
    width: 110,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value ?? '—',
  },
  {
    headerName: 'Highest Degree',
    field: 'qualification_highest_degree',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'License Type',
    field: 'license_no_type',
    width: 140,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'License Expiry',
    field: 'license_expiry_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
];

// ─── Recategorize options ─────────────────────────────────────────────────────
export const PERSONNEL_RECATEGORIZE_OPTIONS = PERSONNEL_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: PERSONNEL_CATEGORY_LABELS[key],
}));

// ─── Section tip text ─────────────────────────────────────────────────────────
export const PERSONNEL_TIP = 'Counts are derived from position/designation keyword matching on MER2 submissions. Yellow column shows personnel whose position didn\'t match any category. Click any count to view the individual personnel records.';

// ─── Section config ───────────────────────────────────────────────────────────
export const personnelConfig = {
  sectionId:    '1B-Personnel',
  sectionTitle: 'Personnel',

  getColumns: (onCountClick = null) => [
    {
      headerName: 'Institution Name',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },
    {
      headerName: 'SAS Head/s',
      field:      'sas_head_name',
      width:      200,
      filter:     'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm font-medium">{params.value}</span>;
      },
    },
    categoryColumn('Registered Guidance Counselors',            'registered_guidance_counselors', onCountClick),
    categoryColumn('Guidance & Counseling',                     'guidance_counseling',             onCountClick),
    categoryColumn('Career Guidance / Placement',               'career_guidance_placement',       onCountClick),
    categoryColumn('Registrars',                                'registrars',                      onCountClick),
    categoryColumn('Admission Personnel',                       'admission_personnel',             onCountClick),
    categoryColumn('Physician',                                 'physician',                       onCountClick),
    categoryColumn('Dentist',                                   'dentist',                         onCountClick),
    categoryColumn('Nurse',                                     'nurse',                           onCountClick),
    categoryColumn('Other Medical / Health Workers',            'other_medical_health',            onCountClick),
    categoryColumn('Security Personnel',                        'security_personnel',              onCountClick),
    categoryColumn('Food Service Personnel',                    'food_service_personnel',          onCountClick),
    categoryColumn('Cultural Affairs',                          'cultural_affairs',                onCountClick),
    categoryColumn('Sports Development',                        'sports_development',              onCountClick),
    categoryColumn('Student Discipline',                        'student_discipline',              onCountClick),
    categoryColumn('Scholarship Personnel',                     'scholarship_personnel',           onCountClick),
    categoryColumn('Housing / Residential / Dorm',              'housing_residential',             onCountClick),
    categoryColumn('PWD / Special Needs',                       'pwd_special_needs',               onCountClick),
    categoryColumn('Student Governance',                        'student_governance',              onCountClick),
    categoryColumn('Student Publication',                       'student_publication',             onCountClick),
    categoryColumn('Multi-faith Services',                      'multi_faith',                     onCountClick),
    {
      headerName: 'Uncategorized',
      field:      'uncategorized',
      width:      130,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        if (params.value === 0) {
          return (
            <button
              className="text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400
                         focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500
                         rounded px-1.5 py-0.5 transition-all text-sm"
              onClick={() => onCountClick?.('uncategorized', params.data.hei_id, params.data.hei_name, params.value)}
              title="No uncategorized personnel — click to view"
            >
              0 +
            </button>
          );
        }
        return (
          <button
            className="font-semibold text-yellow-600 dark:text-yellow-400
                       hover:text-yellow-800 dark:hover:text-yellow-200
                       hover:underline focus:outline-none focus:ring-2
                       focus:ring-offset-1 focus:ring-yellow-500 rounded
                       px-1.5 py-0.5 transition-all"
            onClick={() =>
              onCountClick?.('uncategorized', params.data.hei_id, params.data.hei_name, params.value)
            }
            title="Click to view uncategorized personnel"
          >
            {params.value} →
          </button>
        );
      },
    },
    {
      headerName: 'Total',
      field:      'total_personnel',
      width:      100,
      filter:     'agNumberColumnFilter',
      cellStyle:  { textAlign: 'center', fontWeight: 'bold' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return (
          <button
            className="font-bold text-gray-900 dark:text-white
                       hover:text-blue-700 dark:hover:text-blue-300
                       hover:underline focus:outline-none focus:ring-2
                       focus:ring-offset-1 focus:ring-blue-500 rounded
                       px-1.5 py-0.5 transition-all"
            onClick={() =>
              onCountClick?.('total', params.data.hei_id, params.data.hei_name, params.value)
            }
            title="Click to view all personnel"
          >
            {params.value}
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
