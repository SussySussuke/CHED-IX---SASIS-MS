import StatusBadge from '../../Components/Widgets/StatusBadge';

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

export const studentDisciplineConfig = {
  sectionId:    '7-StudentDiscipline',
  sectionTitle: 'Student Discipline',

  columns: [
    {
      headerName: 'Seq. No.',
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
      width: 80,
      pinned: 'left',
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center', color: '#6b7280' },
    },
    {
      headerName: 'Name of Higher Education Institution',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },
    yesNoCol('Presence of Student Discipline Committee',                 'student_discipline_committee'),
    yesNoCol('Presence of Procedure/Mechanism to Address Student Grievance', 'procedure_mechanism'),
    yesNoCol('Presence of Complaint Desk',                              'complaint_desk'),
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
