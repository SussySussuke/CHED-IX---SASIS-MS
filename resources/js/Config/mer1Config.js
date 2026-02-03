/**
 * MER1 Configuration - HEI Profile on SAS
 * 
 * SINGLE SOURCE OF TRUTH for MER1 structure
 * 
 * MER = Monitoring and Evaluation Report (NOT an Annex)
 * MER1 is a yearly institutional profile form with mixed content:
 * - Locked HEI profile fields (autofilled from institution data)
 * - Editable form fields (SAS head information)
 * - AG Grid tables (educational attainment, trainings)
 */

export const MER1_CONFIG = {
  // Form metadata
  name: 'MER1',
  title: 'MER1: HEI PROFILE ON SAS',
  subtitle: 'Monitoring and Evaluation Report - Institutional Profile',
  endpoint: '/hei/mer1',
  
  // Form sections in order
  sections: [
    {
      id: 'hei_profile',
      type: 'locked_profile',
      title: 'HEI PROFILE ON SAS',
      description: 'This information is automatically filled from your institution account.',
      fields: [
        { 
          key: 'name', 
          label: 'Name of HEI',
          source: 'hei.name' // Autofilled from auth user
        },
        { 
          key: 'code', 
          label: 'Institutional Code',
          source: 'hei.code'
        },
        { 
          key: 'type', 
          label: 'Type of HEI',
          source: 'hei.type'
        },
        { 
          key: 'address', 
          label: 'Address of HEI',
          source: 'hei.address'
        },
      ]
    },
    {
      id: 'divider_report1',
      type: 'divider',
      text: 'REPORT 1.'
    },
    {
      id: 'sas_head_info',
      type: 'form_fields',
      fields: [
        { 
          key: 'sas_head_name', 
          label: 'Name of SAS HEAD', 
          type: 'text',
          required: true,
          placeholder: 'Enter full name'
        },
        { 
          key: 'sas_head_position', 
          label: 'Designation/Position', 
          type: 'text',
          required: true,
          placeholder: 'e.g., Director, Coordinator'
        },
      ]
    },
    {
      id: 'educational_attainment',
      type: 'table',
      title: 'Highest Educational Attainment',
      entityName: 'educational_attainments',
      columns: [
        { 
          field: 'degree_program', 
          headerName: 'Degree Program',
          editable: true,
          minWidth: 200,
          placeholder: 'e.g., PhD in Psychology'
        },
        { 
          field: 'school', 
          headerName: 'School/University where highest degree obtained',
          editable: true,
          minWidth: 250,
          placeholder: 'e.g., University of the Philippines'
        },
        { 
          field: 'year', 
          headerName: 'Year',
          type: 'numeric',
          editable: true,
          minWidth: 100,
          maxLength: 4,
          placeholder: 'YYYY'
        },
      ],
      dataMapper: (entity) => ({
        degree_program: entity.degree_program || '',
        school: entity.school || '',
        year: entity.year || '',
      })
    },
    {
      id: 'permanent_status',
      type: 'form_fields',
      fields: [
        { 
          key: 'permanent_status', 
          label: 'Permanent Every 3 years', 
          type: 'text',
          placeholder: 'FULLTIME',
          helpText: 'Specify employment status',
          fullWidth: true
        },
      ]
    },
    {
      id: 'trainings',
      type: 'table',
      title: 'Latest training/s attended related to SAS',
      subtitle: '(at least three and indicate the title and period/date)',
      entityName: 'trainings',
      columns: [
        { 
          field: 'training_title', 
          headerName: 'Training Title',
          editable: true,
          minWidth: 300,
          placeholder: 'e.g., Mental Health First Aid Training'
        },
        { 
          field: 'period_date', 
          headerName: 'Period/Date',
          type: 'date',
          editable: true,
          minWidth: 200,
          placeholder: 'YYYY-MM-DD'
        },
      ],
      dataMapper: (entity) => ({
        training_title: entity.training_title || '',
        period_date: entity.period_date || '',
      })
    },
    {
      id: 'other_achievements',
      type: 'form_fields',
      fields: [
        { 
          key: 'other_achievements', 
          label: 'Other Achievement/undertaking related to SAS',
          type: 'textarea',
          rows: 6,
          placeholder: 'e.g., researches presented within a research forum - institutional, national, international, etc.'
        },
      ]
    }
  ],

  // Data mapper for loading existing submission
  dataMapper: (backendData) => {
    return {
      // Locked profile fields
      hei_name: backendData.hei_name,
      hei_code: backendData.hei_code,
      hei_type: backendData.hei_type,
      hei_address: backendData.hei_address,
      
      // Form fields
      sas_head_name: backendData.sas_head_name || '',
      sas_head_position: backendData.sas_head_position || '',
      permanent_status: backendData.permanent_status || '',
      other_achievements: backendData.other_achievements || '',
      
      // Tables (handled separately by section dataMappers)
      educational_attainments: backendData.educational_attainments || [],
      trainings: backendData.trainings || [],
    };
  },

  // Payload builder for submission
  buildPayload: (formData, tableData) => {
    // Convert educational_attainments year field from number to string and limit to 4 chars
    const educational_attainments = (tableData.educational_attainments || []).map(item => {
      let yearStr = item.year !== null && item.year !== '' ? String(item.year) : '';
      // Truncate to 4 characters if longer (e.g., "20245" becomes "2024")
      if (yearStr.length > 4) {
        yearStr = yearStr.substring(0, 4);
      }
      return {
        ...item,
        year: yearStr
      };
    });

    return {
      academic_year: formData.academic_year,
      sas_head_name: formData.sas_head_name,
      sas_head_position: formData.sas_head_position,
      permanent_status: formData.permanent_status,
      other_achievements: formData.other_achievements,
      educational_attainments: educational_attainments,
      trainings: tableData.trainings || [],
      request_notes: formData.request_notes || '',
    };
  }
};

/**
 * Get section by ID
 */
export const getMER1Section = (sectionId) => {
  return MER1_CONFIG.sections.find(s => s.id === sectionId);
};

/**
 * Get all table sections
 */
export const getMER1Tables = () => {
  return MER1_CONFIG.sections.filter(s => s.type === 'table');
};

/**
 * Get all form field sections
 */
export const getMER1FormFields = () => {
  return MER1_CONFIG.sections.filter(s => s.type === 'form_fields');
};
