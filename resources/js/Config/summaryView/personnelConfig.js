/**
 * 1B - Personnel Section Configuration
 * Student population demographics by gender
 */
export const personnelConfig = {
  sectionId: '1B-Personnel',
  sectionTitle: 'Personnel',
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
      headerName: 'Male',
      field: 'population_male',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Female',
      field: 'population_female',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Intersex',
      field: 'population_intersex',
      width: 110,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
    {
      headerName: 'Total',
      field: 'population_total',
      width: 120,
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right', fontWeight: '600' },
      cellRenderer: (params) => {
        if (params.value === null || params.value === undefined) {
          return <span className="text-gray-400">—</span>;
        }
        return params.value.toLocaleString();
      },
    },
  ],
};
