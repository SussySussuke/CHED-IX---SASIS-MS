import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Numeric cell (null-safe) ─────────────────────────────────────────────────

function NumCell({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  return <span>{value.toLocaleString()}</span>;
}

// ─── Section config ───────────────────────────────────────────────────────────

export const specialNeedsStatsConfig = {
  sectionId:    '14-SpecialNeeds-Stats',
  sectionTitle: 'Students with Special Needs / PWD Statistics',

  columns: [
    {
      headerName: 'Name of Higher Education Institution',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },

    // ── PWD ────────────────────────────────────────────────────────────────────
    {
      headerName:  'PWD — Enrolled',
      field:       'pwd_enrollment',
      width:       150,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
    },
    {
      headerName:  'PWD — Graduates',
      field:       'pwd_graduates',
      width:       150,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
    },

    // ── Indigenous People ───────────────────────────────────────────────────────
    {
      headerName:  'Indigenous People — Enrolled',
      field:       'ip_enrollment',
      width:       190,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
    },
    {
      headerName:  'Indigenous People — Graduates',
      field:       'ip_graduates',
      width:       190,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
    },

    // ── Solo Parent Dependents ──────────────────────────────────────────────────
    {
      headerName:  'Solo Parent Dependents — Enrolled',
      field:       'solo_parent_enrollment',
      width:       220,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
    },
    {
      headerName:  'Solo Parent Dependents — Graduates',
      field:       'solo_parent_graduates',
      width:       220,
      filter:      'agNumberColumnFilter',
      cellStyle:   { textAlign: 'right' },
      cellRenderer: (params) => <NumCell value={params.value} />,
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
