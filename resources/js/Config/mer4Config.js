/**
 * MER4 Configuration - SAS Programs and Services Strategic Approaches/Actions
 * 
 * SINGLE SOURCE OF TRUTH for MER4 structure
 * 
 * MER4 uses CustomTable for fixed-row tables with:
 * - Fixed rows (no add/remove)
 * - File upload support
 * - Checkbox columns
 * - Text input columns
 */

export const MER4_CONFIG = {
  // Form metadata
  name: 'MER4',
  title: 'Report 4. SAS PROGRAMS AND SERVICES STRATEGIC APPROACHES/ACTIONS',
  subtitle: 'Monitoring and Evaluation Report - Strategic Approaches',
  endpoint: '/hei/mer4',
  
  // Form sections in order
  sections: [
    {
      id: 'sas_management_admin',
      type: 'custom_table',
      title: 'A. SAS MANAGEMENT AND ADMINISTRATION',
      entityName: 'sas_management_items',
      
      // Fixed rows - these cannot be added or removed
      fixedRows: [
        {
          id: 'sas_admin_1',
          requirement: 'Established functional/ operational/ accessible SAS office to manage SAS programs and activities',
        },
        {
          id: 'sas_admin_2',
          requirement: 'Ensured adequate number of qualified and competent personnel to deliver SAS programs and services to students',
        },
        {
          id: 'sas_admin_3',
          requirement: 'Ensured that specific school fees that have been collected to students are judiciously utilized for the delivery of SAS programs and activities',
        },
        {
          id: 'sas_admin_4',
          requirement: 'Developed collaborations or consortia with peer HEIs to be able to deliver critical SAS programs and activities [2]',
        },
        {
          id: 'sas_admin_5',
          requirement: 'Conducted researches related to SAS',
        },
      ],
      
      // Column definitions
      columns: [
        {
          field: 'requirement',
          headerName: 'Minimum Requirements',
          type: 'static', // Non-editable, displays fixed row text
          minWidth: '300px',
        },
        {
          field: 'evidence_file',
          headerName: 'Evidence/Supporting Documents',
          type: 'file',
          accept: '.pdf',
          minWidth: '250px',
        },
        {
          field: 'status_compiled',
          headerName: 'Status: Compiled',
          type: 'checkbox',
          width: '150px',
        },
        {
          field: 'hei_remarks',
          headerName: 'HEI Remarks',
          type: 'text',
          placeholder: 'Enter remarks...',
          minWidth: '200px',
        },
      ],
      
      // Data mapper for loading existing submissions
      dataMapper: (entity) => ({
        id: entity.row_id, // Map row_id from DB to id for frontend
        requirement: entity.requirement,
        evidence_file: entity.evidence_file ? JSON.parse(entity.evidence_file) : null,
        status_compiled: entity.status_compiled || false,
        hei_remarks: entity.hei_remarks || '',
      })
    },
    
    {
      id: 'guidance_counseling',
      type: 'custom_table',
      title: 'B. Guidance and Counseling Office',
      entityName: 'guidance_counseling_items',
      
      // Fixed rows - these cannot be added or removed
      fixedRows: [
        {
          id: 'guidance_1',
          requirement: 'Established functional/ operational/ accessible SAS office to manage SAS programs and activities',
        },
        {
          id: 'guidance_2',
          requirement: 'Maintained operations of SAS during pandemic and other similar situation',
        },
        {
          id: 'guidance_3',
          requirement: 'Ensured adequate number of qualified and competent personnel to deliver SAS programs and services to students',
        },
      ],
      
      // Column definitions (same structure as above)
      columns: [
        {
          field: 'requirement',
          headerName: 'Minimum Requirements',
          type: 'static',
          minWidth: '300px',
        },
        {
          field: 'evidence_file',
          headerName: 'Evidence/Supporting Documents',
          type: 'file',
          accept: '.pdf',
          minWidth: '250px',
        },
        {
          field: 'status_compiled',
          headerName: 'Status: Compiled',
          type: 'checkbox',
          width: '150px',
        },
        {
          field: 'hei_remarks',
          headerName: 'HEI Remarks',
          type: 'text',
          placeholder: 'Enter remarks...',
          minWidth: '200px',
        },
      ],
      
      // Data mapper for loading existing submissions
      dataMapper: (entity) => ({
        id: entity.row_id, // Map row_id from DB to id for frontend
        requirement: entity.requirement,
        evidence_file: entity.evidence_file ? JSON.parse(entity.evidence_file) : null,
        status_compiled: entity.status_compiled || false,
        hei_remarks: entity.hei_remarks || '',
      })
    },
  ],

  // Payload builder for submission
  buildPayload: (formData, tableData) => {
    // Convert file objects to JSON strings for storage
    const processFileData = (items) => {
      return items.map(item => ({
        ...item,
        evidence_file: item.evidence_file ? JSON.stringify(item.evidence_file) : null,
      }));
    };

    return {
      academic_year: formData.academic_year,
      sas_management_items: processFileData(tableData.sas_management_items || []),
      guidance_counseling_items: processFileData(tableData.guidance_counseling_items || []),
      request_notes: formData.request_notes || '',
    };
  }
};

/**
 * Get section by ID
 */
export const getMER4Section = (sectionId) => {
  return MER4_CONFIG.sections.find(s => s.id === sectionId);
};

/**
 * Get all custom table sections
 */
export const getMER4Tables = () => {
  return MER4_CONFIG.sections.filter(s => s.type === 'custom_table');
};
