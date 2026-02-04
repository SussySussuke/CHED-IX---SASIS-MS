/**
 * SharedRenderer Configuration
 * 
 * Defines how different forms should be rendered in the SharedRenderer component.
 * This is the SINGLE SOURCE OF TRUTH for multi-section form rendering.
 * 
 * RENDER TYPES:
 * - 'form-only': Only displays form fields (SUMMARY, D)
 * - 'table-only': Single table view (most standard annexes)
 * - 'hybrid': Combination of form fields + one or more tables (MER1, MER2, MER3, G)
 * 
 * Forms NOT using SharedRenderer (have custom renderers in AnnexRenderers.jsx):
 * - H, M (too complex/unique)
 */

/**
 * SUMMARY Configuration - Form Only
 */
export const SUMMARY_CONFIG = {
  renderType: 'form-only',
  
  formSections: [
    {
      key: 'summary',
      title: 'School Details',
      layout: '2-column',  // Grid layout
      fields: [
        { key: 'academic_year', label: 'Academic Year' },
        { key: 'population_male', label: 'Male Population', format: 'number' },
        { key: 'population_female', label: 'Female Population', format: 'number' },
        { key: 'population_intersex', label: 'Intersex Population', format: 'number' },
        { key: 'population_total', label: 'Total Population', format: 'number' },
        { key: 'hei_website', label: 'HEI Website', format: 'url' },
        { key: 'sas_website', label: 'SAS Website', format: 'url' },
        { key: 'student_handbook', label: 'Student Handbook' },
        { key: 'student_publication', label: 'Student Publication' },
      ]
    }
  ],
  
  // Special handling for array fields
  specialFields: [
    {
      key: 'social_media_contacts',
      type: 'array-list',
      title: 'Social Media Contacts'
    }
  ]
};

/**
 * Annex D Configuration - Form Only (Student Handbook)
 */
export const ANNEX_D_CONFIG = {
  renderType: 'form-only',
  
  formSections: [
    {
      key: 'submission',
      title: 'Basic Information',
      layout: '2-column',
      fields: [
        { key: 'version_publication_date', label: 'Version Publication Date', format: 'date' },
        { key: 'officer_in_charge', label: 'Officer in Charge' },
        { key: 'handbook_committee', label: 'Handbook Committee' },
      ]
    },
    {
      key: 'submission',
      title: 'Mode of Dissemination',
      layout: '2-column',
      fields: [
        { key: 'dissemination_orientation', label: 'Dissemination Orientation', format: 'boolean' },
        { key: 'orientation_dates', label: 'Orientation Dates' },
        { key: 'mode_of_delivery', label: 'Mode of Delivery' },
        { key: 'dissemination_uploaded', label: 'Dissemination Uploaded', format: 'boolean' },
        { key: 'dissemination_others', label: 'Dissemination Others', format: 'boolean' },
        { key: 'dissemination_others_text', label: 'Dissemination Others Text' },
      ]
    },
    {
      key: 'submission',
      title: 'Type of Handbook/Manual',
      layout: '2-column',
      fields: [
        { key: 'type_digital', label: 'Type Digital', format: 'boolean' },
        { key: 'type_printed', label: 'Type Printed', format: 'boolean' },
        { key: 'type_others', label: 'Type Others', format: 'boolean' },
        { key: 'type_others_text', label: 'Type Others Text' },
      ]
    },
    {
      key: 'submission',
      title: 'Checklist',
      layout: '2-column',
      fields: [
        { key: 'has_academic_policies', label: 'Academic Policies', format: 'boolean' },
        { key: 'has_admission_requirements', label: 'Admission Requirements', format: 'boolean' },
        { key: 'has_code_of_conduct', label: 'Code of Conduct', format: 'boolean' },
        { key: 'has_scholarships', label: 'Scholarships', format: 'boolean' },
        { key: 'has_student_publication', label: 'Student Publication', format: 'boolean' },
        { key: 'has_housing_services', label: 'Housing Services', format: 'boolean' },
        { key: 'has_disability_services', label: 'Disability Services', format: 'boolean' },
        { key: 'has_student_council', label: 'Student Council', format: 'boolean' },
        { key: 'has_refund_policies', label: 'Refund Policies', format: 'boolean' },
        { key: 'has_drug_education', label: 'Drug Education', format: 'boolean' },
        { key: 'has_foreign_students', label: 'Foreign Students', format: 'boolean' },
        { key: 'has_disaster_management', label: 'Disaster Management', format: 'boolean' },
        { key: 'has_safe_spaces', label: 'Safe Spaces', format: 'boolean' },
        { key: 'has_anti_hazing', label: 'Anti Hazing', format: 'boolean' },
        { key: 'has_anti_bullying', label: 'Anti Bullying', format: 'boolean' },
        { key: 'has_violence_against_women', label: 'Violence Against Women', format: 'boolean' },
        { key: 'has_gender_fair', label: 'Gender Fair', format: 'boolean' },
        { key: 'has_others', label: 'Others', format: 'boolean' },
        { key: 'has_others_text', label: 'Others Text' },
      ]
    }
  ]
};

/**
 * Annex G Configuration - Hybrid (Student Publication)
 */
export const ANNEX_G_CONFIG = {
  renderType: 'hybrid',
  
  formSection: {
    key: 'batch',
    title: 'Publication Information',
    layout: '2-column',
    fields: [
      { key: 'official_school_name', label: 'Official School Name' },
      { key: 'student_publication_name', label: 'Student Publication Name' },
      { key: 'publication_fee_per_student', label: 'Publication Fee per Student', format: 'currency' },
      { key: 'adviser_name', label: 'Adviser Name' },
      { key: 'adviser_position_designation', label: 'Adviser Position/Designation' },
    ]
  },
  
  // Additional form section for frequencies and types (booleans)
  formSections: [
    {
      key: 'batch',
      title: 'Publication Frequency',
      layout: '2-column',
      fields: [
        { key: 'frequency_monthly', label: 'Monthly', format: 'boolean' },
        { key: 'frequency_quarterly', label: 'Quarterly', format: 'boolean' },
        { key: 'frequency_annual', label: 'Annual', format: 'boolean' },
        { key: 'frequency_per_semester', label: 'Per Semester', format: 'boolean' },
        { key: 'frequency_others', label: 'Others', format: 'boolean' },
        { key: 'frequency_others_specify', label: 'Frequency Others (Specify)' },
      ]
    },
    {
      key: 'batch',
      title: 'Publication Type',
      layout: '2-column',
      fields: [
        { key: 'publication_type_newsletter', label: 'Newsletter', format: 'boolean' },
        { key: 'publication_type_gazette', label: 'Gazette', format: 'boolean' },
        { key: 'publication_type_magazine', label: 'Magazine', format: 'boolean' },
        { key: 'publication_type_others', label: 'Others', format: 'boolean' },
        { key: 'publication_type_others_specify', label: 'Publication Type Others (Specify)' },
      ]
    }
  ],
  
  tableSections: [
    {
      key: 'editorial_boards',
      title: 'Editorial Board Members',
      columns: [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
        { field: 'position_in_editorial_board', headerName: 'Position', flex: 1, minWidth: 200 },
        { field: 'degree_program_year_level', headerName: 'Degree Program & Year', flex: 1, minWidth: 250 }
      ],
      optional: true
    },
    {
      key: 'other_publications',
      title: 'Other Publications',
      columns: [
        { field: 'publication_name', headerName: 'Publication Name', flex: 1, minWidth: 250 },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 300 }
      ],
      optional: true
    },
    {
      key: 'programs',
      title: 'Programs/Activities',
      columns: [
        { field: 'program_activity', headerName: 'Program/Activity', flex: 1, minWidth: 300 },
        { field: 'date_conducted', headerName: 'Date Conducted', width: 150 },
        { field: 'participants', headerName: 'Participants', width: 120, type: 'numericColumn' }
      ],
      optional: true
    }
  ]
};

/**
 * MER1 Configuration - Hybrid
 */
export const MER1_CONFIG = {
  renderType: 'hybrid',
  
  formSection: {
    key: 'batch',
    title: 'SAS Head Information',
    layout: '2-column',
    fields: [
      { key: 'sas_head_name', label: 'Name' },
      { key: 'sas_head_position', label: 'Position' },
      { key: 'permanent_status', label: 'Permanent Status' },
    ]
  },
  
  tableSections: [
    {
      key: 'educational_attainments',
      title: 'Highest Educational Attainment',
      columns: [
        { field: 'degree_program', headerName: 'Degree Program', flex: 1, minWidth: 200 },
        { field: 'school', headerName: 'School/University', flex: 1, minWidth: 250 },
        { field: 'year', headerName: 'Year', width: 100 }
      ],
      optional: true
    },
    {
      key: 'trainings',
      title: 'Latest Training/s Attended',
      columns: [
        { field: 'training_title', headerName: 'Training Title', flex: 1, minWidth: 300 },
        { field: 'period_date', headerName: 'Period/Date', flex: 1, minWidth: 200 }
      ],
      optional: true
    }
  ],
  
  textSections: [
    {
      key: 'other_achievements',
      title: 'Other Achievements'
    }
  ]
};

/**
 * MER2 Configuration - Hybrid (HEI Directory of SAS)
 * Has 4 separate tables grouped by office type
 */
export const MER2_CONFIG = {
  renderType: 'hybrid',
  
  formSection: {
    key: 'batch',
    title: 'Student Affairs Services Information',
    layout: '2-column',
    fields: [
      { key: 'academic_year', label: 'Academic Year' },
      { key: 'office_student_affairs_students_handled', label: 'Office of Student Affairs - Students Handled', format: 'number' },
      { key: 'guidance_office_students_handled', label: 'Guidance Office - Students Handled', format: 'number' },
      { key: 'career_dev_center_students_handled', label: 'Career Development Center - Students Handled', format: 'number' },
      { key: 'student_dev_welfare_students_handled', label: 'Student Dev. & Welfare - Students Handled', format: 'number' },
    ]
  },
  
  // MER2 uses grouped tables - personnel array needs to be split by office_type
  groupedTableSections: {
    dataKey: 'personnel',
    groupBy: 'office_type',
    tables: [
      {
        groupValue: 'office_student_affairs',
        title: '1. Office of Student Affairs - Personnel',
        columns: [
          { field: 'name_of_personnel', headerName: 'Name', flex: 1, minWidth: 200 },
          { field: 'position_designation', headerName: 'Position/Designation', flex: 1, minWidth: 180 },
          { field: 'tenure_nature_of_appointment', headerName: 'Tenure/Nature', flex: 1, minWidth: 150 },
          { field: 'years_in_office', headerName: 'Years in Office', width: 120, type: 'numericColumn' },
          { field: 'qualification_highest_degree', headerName: 'Highest Degree', flex: 1, minWidth: 150 },
          { field: 'license_no_type', headerName: 'License No/Type', flex: 1, minWidth: 150 },
          { field: 'license_expiry_date', headerName: 'License Expiry', width: 130 }
        ]
      },
      {
        groupValue: 'guidance_office',
        title: '2. Guidance Office - Personnel',
        columns: [
          { field: 'name_of_personnel', headerName: 'Name', flex: 1, minWidth: 200 },
          { field: 'position_designation', headerName: 'Position/Designation', flex: 1, minWidth: 180 },
          { field: 'tenure_nature_of_appointment', headerName: 'Tenure/Nature', flex: 1, minWidth: 150 },
          { field: 'years_in_office', headerName: 'Years in Office', width: 120, type: 'numericColumn' },
          { field: 'qualification_highest_degree', headerName: 'Highest Degree', flex: 1, minWidth: 150 },
          { field: 'license_no_type', headerName: 'License No/Type', flex: 1, minWidth: 150 },
          { field: 'license_expiry_date', headerName: 'License Expiry', width: 130 }
        ]
      },
      {
        groupValue: 'career_dev_center',
        title: '3. Career Development Center - Personnel',
        columns: [
          { field: 'name_of_personnel', headerName: 'Name', flex: 1, minWidth: 200 },
          { field: 'position_designation', headerName: 'Position/Designation', flex: 1, minWidth: 180 },
          { field: 'tenure_nature_of_appointment', headerName: 'Tenure/Nature', flex: 1, minWidth: 150 },
          { field: 'years_in_office', headerName: 'Years in Office', width: 120, type: 'numericColumn' },
          { field: 'qualification_highest_degree', headerName: 'Highest Degree', flex: 1, minWidth: 150 },
          { field: 'license_no_type', headerName: 'License No/Type', flex: 1, minWidth: 150 },
          { field: 'license_expiry_date', headerName: 'License Expiry', width: 130 }
        ]
      },
      {
        groupValue: 'student_dev_welfare',
        title: '4. Student Development and Welfare Office - Personnel',
        columns: [
          { field: 'name_of_personnel', headerName: 'Name', flex: 1, minWidth: 200 },
          { field: 'position_designation', headerName: 'Position/Designation', flex: 1, minWidth: 180 },
          { field: 'tenure_nature_of_appointment', headerName: 'Tenure/Nature', flex: 1, minWidth: 150 },
          { field: 'years_in_office', headerName: 'Years in Office', width: 120, type: 'numericColumn' },
          { field: 'qualification_highest_degree', headerName: 'Highest Degree', flex: 1, minWidth: 150 },
          { field: 'license_no_type', headerName: 'License No/Type', flex: 1, minWidth: 150 },
          { field: 'license_expiry_date', headerName: 'License Expiry', width: 130 }
        ]
      }
    ]
  }
};

/**
 * MER3 Configuration - Table Only (Matrix of School Fees)
 */
export const MER3_CONFIG = {
  renderType: 'table-only',
  
  tableSections: [
    {
      key: 'school_fees',
      title: 'School Fees for Student Affairs Services',
      columns: [
        { field: 'name_of_school_fees', headerName: 'Name of School Fees', flex: 1, minWidth: 250 },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 300 },
        { 
          field: 'amount', 
          headerName: 'Amount', 
          width: 150, 
          type: 'numericColumn',
          valueFormatter: params => {
            if (params.value == null) return '';
            return '₱' + Number(params.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        },
        { field: 'remarks', headerName: 'Remarks', flex: 1, minWidth: 200 }
      ],
      optional: false
    }
  ]
};

/**
 * Standard Annex Configuration Template
 * Most annexes (A, B, C, C-1, E, F, I, I-1, J, K, L, L-1, N, N-1, O) follow this pattern
 */
export const STANDARD_ANNEX_CONFIG = {
  renderType: 'table-only',
  
  tableSections: [
    {
      key: 'entities',
      title: null,
      useAnnexConfig: true
    }
  ]
};

/**
 * Get renderer configuration for a given form/annex
 * @param {string} annexType - The annex identifier (A-O, MER1-3, SUMMARY, etc.)
 * @returns {object|null} The renderer configuration or null if not using SharedRenderer
 */
export function getSharedRendererConfig(annexType) {
  // Special forms with custom configs
  if (annexType === 'SUMMARY') return SUMMARY_CONFIG;
  if (annexType === 'D') return ANNEX_D_CONFIG;
  if (annexType === 'G') return ANNEX_G_CONFIG;
  if (annexType === 'MER1') return MER1_CONFIG;
  if (annexType === 'MER2') return MER2_CONFIG;
  if (annexType === 'MER3') return MER3_CONFIG;
  
  // These forms use custom renderers in AnnexRenderers.jsx (too complex)
  const customRendererForms = ['H', 'M'];
  if (customRendererForms.includes(annexType)) {
    return null;
  }
  
  // All other standard annexes use the standard template
  return STANDARD_ANNEX_CONFIG;
}

/**
 * Check if a form uses SharedRenderer
 * @param {string} annexType - The annex identifier
 * @returns {boolean} True if form uses SharedRenderer
 */
export function usesSharedRenderer(annexType) {
  return getSharedRendererConfig(annexType) !== null;
}
