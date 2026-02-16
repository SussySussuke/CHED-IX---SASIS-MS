import StatusBadge from '../../Components/Widgets/StatusBadge';

/**
 * 2-Info-Orientation Section Configuration
 * Information and Orientation Services & Activities (Annex F)
 * 
 * Displays aggregated activity data by category:
 * - Campus Orientation
 * - Gender Sensitivity/VAWC
 * - Anti-Hazing
 * - Substance Abuse
 * - Sexual/Reproductive Health
 * - Mental Health/Wellness
 * - Disaster Risk Management
 * 
 * Note: The columns accept an onCellClick callback that can be passed dynamically
 */
export const infoOrientationConfig = {
  sectionId: '2-Info-Orientation',
  sectionTitle: 'Information and Orientation Services & Activities',
  
  /**
   * Generate columns with optional click handlers
   * @param {Function} onActivityClick - Callback when activity count is clicked
   *                                      Receives (category, heiId, heiName, activityCount)
   */
  getColumns: (onActivityClick = null) => [
    {
      headerName: 'HEI Name',
      field: 'hei_name',
      flex: 1,
      minWidth: 300,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellStyle: { fontWeight: '500' },
    },
    
    // Campus Orientation for Freshmen and new students
    {
      headerName: 'Campus Orientation',
      children: [
        {
          headerName: 'Activities',
          field: 'campus_orientation_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('campus_orientation', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'campus_orientation_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Gender-Sensitivity/VAWC services
    {
      headerName: 'Gender-Sensitivity/VAWC',
      children: [
        {
          headerName: 'Activities',
          field: 'gender_sensitivity_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('gender_sensitivity', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'gender_sensitivity_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Anti-Hazing
    {
      headerName: 'Anti-Hazing',
      children: [
        {
          headerName: 'Activities',
          field: 'anti_hazing_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('anti_hazing', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'anti_hazing_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Substance-abuse campaigns
    {
      headerName: 'Substance-Abuse Campaigns',
      children: [
        {
          headerName: 'Activities',
          field: 'substance_abuse_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('substance_abuse', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'substance_abuse_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Sexual and reproductive health (HIV/AIDS)
    {
      headerName: 'Sexual/Reproductive Health',
      children: [
        {
          headerName: 'Activities',
          field: 'sexual_health_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('sexual_health', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'sexual_health_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Mental health / well-being/ wellness
    {
      headerName: 'Mental Health/Wellness',
      children: [
        {
          headerName: 'Activities',
          field: 'mental_health_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('mental_health', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'mental_health_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Earthquake and Fire Drill & Philippine Disaster Risk Reduction
    {
      headerName: 'Disaster Risk Management',
      children: [
        {
          headerName: 'Activities',
          field: 'disaster_risk_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return (
              <button 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-2 py-0.5 transition-all"
                onClick={() => onActivityClick && onActivityClick('disaster_risk', params.data.hei_id, params.data.hei_name, params.value)}
                title="Click to view program details"
              >
                {params.value} →
              </button>
            );
          },
        },
        {
          headerName: 'Students',
          field: 'disaster_risk_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-medium">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Total column
    {
      headerName: 'Total',
      children: [
        {
          headerName: 'Activities',
          field: 'total_activities',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center', fontWeight: 'bold' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-bold text-gray-900 dark:text-white">{params.value}</span>;
          },
        },
        {
          headerName: 'Students',
          field: 'total_students',
          width: 100,
          filter: 'agNumberColumnFilter',
          cellStyle: { textAlign: 'center', fontWeight: 'bold' },
          cellRenderer: (params) => {
            if (!params.value && params.value !== 0) return <span className="text-gray-400">—</span>;
            return <span className="font-bold text-gray-900 dark:text-white">{params.value.toLocaleString()}</span>;
          },
        },
      ],
    },
    
    // Services/Activities Details
    {
      headerName: 'Name of Services/Activities',
      field: 'services_activities_list',
      width: 300,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        if (!params.value) return <span className="text-gray-400">—</span>;
        return (
          <span className="text-sm" title={params.value}>
            {params.value.length > 50 ? params.value.substring(0, 50) + '...' : params.value}
          </span>
        );
      },
    },
    
    // Status column
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
  ],
  
  // For backward compatibility, expose columns without handlers
  get columns() {
    return this.getColumns(null);
  },
};
