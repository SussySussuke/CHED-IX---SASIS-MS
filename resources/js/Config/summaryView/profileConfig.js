import StatusBadge from '../../Components/Widgets/StatusBadge';

/**
 * 1A - Profile Section Configuration
 * Basic institution information and identification
 */
export const profileConfig = {
  sectionId: '1A-Profile',
  sectionTitle: 'Profile',
  columns: [
    {
      headerName: 'HEI Code',
      field: 'hei_code',
      width: 130,
      filter: 'agTextColumnFilter',
      cellStyle: { fontWeight: '500' },
      pinned: 'left',
    },
    {
      headerName: 'Institution Name',
      field: 'hei_name',
      flex: 1,
      minWidth: 300,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Type',
      field: 'hei_type',
      width: 100,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Org Chart',
      field: 'submitted_org_chart',
      width: 130,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return params.value.toUpperCase();
      },
    },
    {
      headerName: 'HEI Website',
      field: 'hei_website',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <a 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {params.value.length > 30 ? params.value.substring(0, 30) + '...' : params.value}
          </a>
        );
      },
    },
    {
      headerName: 'SAS Website',
      field: 'sas_website',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <a 
            href={params.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {params.value.length > 30 ? params.value.substring(0, 30) + '...' : params.value}
          </a>
        );
      },
    },
    {
      headerName: 'Social Media',
      field: 'social_media_contacts',
      width: 250,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        const text = params.value;
        return (
          <span className="text-sm" title={text}>
            {text.length > 40 ? text.substring(0, 40) + '...' : text}
          </span>
        );
      },
    },
    {
      headerName: 'Student Handbook',
      field: 'student_handbook',
      width: 180,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm">{params.value}</span>;
      },
    },
    {
      headerName: 'Student Publication',
      field: 'student_publication',
      width: 200,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return <span className="text-sm">{params.value}</span>;
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        return (
          <div className="flex justify-center">
            <StatusBadge status={params.value} />
          </div>
        );
      },
      cellStyle: { textAlign: 'center' },
    },
    {
      headerName: 'Submitted At',
      field: 'submitted_at',
      width: 180,
      filter: 'agDateColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return new Date(params.value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ],
};
