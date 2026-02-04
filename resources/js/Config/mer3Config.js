/**
 * MER3 Configuration - Matrix of School Fees for SAS Programs and Activities
 * 
 * SINGLE SOURCE OF TRUTH for MER3 structure
 * 
 * MER3 contains a single table for school fees with columns:
 * - Name of School Fees
 * - Description
 * - Amount
 * - Remarks, if any
 */

/**
 * School fees column definition
 */
const SCHOOL_FEES_COLUMNS = [
  {
    field: 'name_of_school_fees',
    headerName: 'Name of School Fees',
    editable: true,
    minWidth: 200,
    placeholder: 'e.g., Library Fee, Laboratory Fee'
  },
  {
    field: 'description',
    headerName: 'Description',
    editable: true,
    minWidth: 250,
    placeholder: 'Provide detailed description of the fee'
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'numeric',
    editable: true,
    minWidth: 150,
    placeholder: 'e.g., 500.00'
  },
  {
    field: 'remarks',
    headerName: 'Remarks, if any',
    editable: true,
    minWidth: 200,
    placeholder: 'Any additional remarks or notes'
  },
];

/**
 * Data mapper for school fees rows
 */
const schoolFeesDataMapper = (entity) => ({
  name_of_school_fees: entity.name_of_school_fees || '',
  description: entity.description || '',
  amount: entity.amount || null,
  remarks: entity.remarks || '',
});

export const MER3_CONFIG = {
  // Form metadata
  name: 'MER3',
  title: 'MER3: MATRIX OF SCHOOL FEES FOR SAS PROGRAMS AND ACTIVITIES',
  subtitle: 'Monitoring and Evaluation Report - School Fees Matrix',
  endpoint: '/hei/mer3',
  
  // Form sections in order
  sections: [
    {
      id: 'divider_report3',
      type: 'divider',
      text: 'REPORT 3.'
    },
    
    // ========================================
    // TABLE: School Fees
    // ========================================
    {
      id: 'school_fees_table',
      type: 'table',
      title: 'School Fees Matrix',
      subtitle: [
        'Please list other school fees (OSF) whether they have increased or not.',
        'Public HEIs such as State Universities and Colleges (SUCs) and local Universities and Colleges (LUCs) may attach their schedules of fees duly approved by the UniFAST and Department of Budget and Management (DBM).'
      ],
      entityName: 'school_fees',
      columns: SCHOOL_FEES_COLUMNS,
      dataMapper: schoolFeesDataMapper,
    },
  ],

  // Data mapper for loading existing submission
  dataMapper: (backendData) => {
    return {
      // School fees table (handled separately by section dataMapper)
      school_fees: backendData.school_fees || [],
    };
  },

  // Payload builder for submission
  buildPayload: (formData, tableData) => {
    return {
      academic_year: formData.academic_year,
      
      // School fees data
      school_fees: tableData.school_fees || [],
      
      request_notes: formData.request_notes || '',
    };
  }
};

/**
 * Get section by ID
 */
export const getMER3Section = (sectionId) => {
  return MER3_CONFIG.sections.find(s => s.id === sectionId);
};

/**
 * Get all table sections
 */
export const getMER3Tables = () => {
  return MER3_CONFIG.sections.filter(s => s.type === 'table');
};
