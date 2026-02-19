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
    width: 120,
    filter: 'agTextColumnFilter',
    cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cellRenderer: (params) => <YesNoCell value={params.value} />,
  };
}

export const admissionConfig = {
  sectionId:    '6-Admission',
  sectionTitle: 'Admission Services',

  columns: [
    {
      headerName: 'Name of HEI',
      field:      'hei_name',
      flex:       1,
      minWidth:   280,
      filter:     'agTextColumnFilter',
      pinned:     'left',
      cellStyle:  { fontWeight: '500' },
    },
    yesNoCol('Admission Policy / Criteria', 'admission_policy'),
    yesNoCol('PWD Admission Guidelines',    'pwd_guidelines'),
    yesNoCol('Foreign Student Guidelines',  'foreign_guidelines'),
    yesNoCol('Drug Testing Required',       'drug_testing'),
    yesNoCol('Medical Certificate Required','medical_cert'),
    yesNoCol('Online Enrolment & Payment',  'online_enrollment'),
    yesNoCol('Entrance Exam',               'entrance_exam'),
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
