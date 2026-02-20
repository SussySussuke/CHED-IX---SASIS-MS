import StatusBadge from '../../Components/Widgets/StatusBadge';

// ─── Yes/No cell renderer ─────────────────────────────────────────────────────

function YesNoCell({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }
  if (value === true) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
        Yes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
      No
    </span>
  );
}

function yesNoCol(headerName, field) {
  return {
    headerName,
    field,
    width: 180,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cellRenderer: (params) => <YesNoCell value={params.value} />,
  };
}

// ─── Section config ───────────────────────────────────────────────────────────

export const safetySecurityConfig = {
  sectionId:    '12-SafetySecurity',
  sectionTitle: 'Safety and Security',

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
    yesNoCol('Presence of Committee for Safety and Security',                                              'safety_security_committee'),
    yesNoCol('Presence of School Disaster Risk Reduction and Management',                                  'disaster_risk_reduction'),
    yesNoCol('Presence of Institutional Calamity Management Team',                                         'calamity_management'),
    yesNoCol('Presence of Crisis Management Committee',                                                    'crisis_management_committee'),
    yesNoCol('Presence of Crisis Management for Psychosocial Support',                                     'crisis_psychosocial'),
    yesNoCol('Presence of Functional Drug-Free Committee (established structure, policies and advocacies)', 'drug_free_committee'),
    yesNoCol('Guidance Counselors/HEI Key Personnel Trained on Preventive Drug Education',                 'drug_education_trained'),
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
