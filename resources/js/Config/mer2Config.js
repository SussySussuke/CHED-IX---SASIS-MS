/**
 * MER2 Configuration - HEI Directory of SAS
 * 
 * SINGLE SOURCE OF TRUTH for MER2 structure
 * 
 * MER2 contains 4 identical personnel tables for different offices:
 * - Office of Student Affairs
 * - Guidance Office
 * - Career Development Center
 * - Student Development and Welfare Office
 * 
 * Each table has:
 * - Personnel information columns (name, position, tenure, years, qualification)
 * - License/Eligibility grouped columns (type, expiry date)
 * - Summary row (auto-counted personnel + manual student count input)
 */

/**
 * Base column definition used by all 4 tables
 * This is the DRY approach - define once, reuse 4 times
 */
const BASE_PERSONNEL_COLUMNS = [
  {
    field: 'name_of_personnel',
    headerName: 'Name of Personnel',
    editable: true,
    minWidth: 200,
    placeholder: 'e.g., Juan Dela Cruz'
  },
  {
    field: 'position_designation',
    headerName: 'Position/Designation',
    editable: true,
    minWidth: 180,
    placeholder: 'e.g., Guidance Counselor'
  },
  {
    field: 'tenure_nature_of_appointment',
    headerName: 'Tenure/Nature of Appointment',
    editable: true,
    minWidth: 200,
    placeholder: 'e.g., Permanent, Contractual'
  },
  {
    field: 'years_in_office',
    headerName: 'No. of Years in the Office/Unit/SAS Service',
    type: 'numeric',
    editable: true,
    minWidth: 180,
    placeholder: 'e.g., 5'
  },
  {
    field: 'qualification_highest_degree',
    headerName: 'Qualification/Highest degree',
    editable: true,
    minWidth: 200,
    placeholder: 'e.g., Masters in Psychology'
  },
  // Grouped header: License/Eligibility (if applicable)
  {
    field: 'license_no_type',
    headerName: 'License No. Type',
    headerGroup: 'License/Eligibility (if applicable)',
    editable: true,
    minWidth: 150,
    placeholder: 'e.g., RPsy, LPT'
  },
  {
    field: 'license_expiry_date',
    headerName: 'Expiry Date',
    headerGroup: 'License/Eligibility (if applicable)',
    type: 'date',
    editable: true,
    minWidth: 150,
    placeholder: 'YYYY-MM-DD'
  },
];

/**
 * Data mapper for personnel rows
 */
const personnelDataMapper = (entity) => ({
  name_of_personnel: entity.name_of_personnel || '',
  position_designation: entity.position_designation || '',
  tenure_nature_of_appointment: entity.tenure_nature_of_appointment || '',
  years_in_office: entity.years_in_office || null,
  qualification_highest_degree: entity.qualification_highest_degree || '',
  license_no_type: entity.license_no_type || '',
  license_expiry_date: entity.license_expiry_date || '',
});

export const MER2_CONFIG = {
  // Form metadata
  name: 'MER2',
  title: 'MER2: HEI DIRECTORY OF SAS',
  subtitle: 'Monitoring and Evaluation Report - Personnel Directory',
  endpoint: '/hei/mer2',
  
  // Form sections in order
  sections: [
    {
      id: 'divider_report2',
      type: 'divider',
      text: 'REPORT 2.'
    },
    
    // ========================================
    // TABLE 1: Office of Student Affairs
    // ========================================
    {
      id: 'office_student_affairs',
      type: 'table',
      title: 'Office of Student Affairs',
      entityName: 'office_student_affairs_personnel',
      columns: BASE_PERSONNEL_COLUMNS,
      dataMapper: personnelDataMapper,
      // Summary configuration
      summary: {
        personnelCountLabel: 'Total no. of personnel = ',
        studentsHandledKey: 'office_student_affairs_students_handled',
        studentsHandledLabel: 'Total no. of students handled:',
        studentsHandledPlaceholder: 'Enter number of students'
      }
    },
    
    // ========================================
    // TABLE 2: Guidance Office
    // ========================================
    {
      id: 'guidance_office',
      type: 'table',
      title: 'Guidance Office',
      entityName: 'guidance_office_personnel',
      columns: BASE_PERSONNEL_COLUMNS,
      dataMapper: personnelDataMapper,
      summary: {
        personnelCountLabel: 'Total no. of personnel = ',
        studentsHandledKey: 'guidance_office_students_handled',
        studentsHandledLabel: 'Total no. of students handled:',
        studentsHandledPlaceholder: 'Enter number of students'
      }
    },
    
    // ========================================
    // TABLE 3: Career Development Center
    // ========================================
    {
      id: 'career_dev_center',
      type: 'table',
      title: 'Career Development Center',
      entityName: 'career_dev_center_personnel',
      columns: BASE_PERSONNEL_COLUMNS,
      dataMapper: personnelDataMapper,
      summary: {
        personnelCountLabel: 'Total no. of personnel = ',
        studentsHandledKey: 'career_dev_center_students_handled',
        studentsHandledLabel: 'Total no. of students handled:',
        studentsHandledPlaceholder: 'Enter number of students'
      }
    },
    
    // ========================================
    // TABLE 4: Student Development and Welfare Office
    // ========================================
    {
      id: 'student_dev_welfare',
      type: 'table',
      title: 'Student Development and Welfare Office',
      entityName: 'student_dev_welfare_personnel',
      columns: BASE_PERSONNEL_COLUMNS,
      dataMapper: personnelDataMapper,
      summary: {
        personnelCountLabel: 'Total no. of personnel = ',
        studentsHandledKey: 'student_dev_welfare_students_handled',
        studentsHandledLabel: 'Total no. of students handled:',
        studentsHandledPlaceholder: 'Enter number of students'
      }
    },
  ],

  // Data mapper for loading existing submission
  dataMapper: (backendData) => {
    return {
      // Student counts (manual input fields)
      office_student_affairs_students_handled: backendData.office_student_affairs_students_handled || '',
      guidance_office_students_handled: backendData.guidance_office_students_handled || '',
      career_dev_center_students_handled: backendData.career_dev_center_students_handled || '',
      student_dev_welfare_students_handled: backendData.student_dev_welfare_students_handled || '',
      
      // Personnel tables (handled separately by section dataMappers)
      office_student_affairs_personnel: backendData.office_student_affairs_personnel || [],
      guidance_office_personnel: backendData.guidance_office_personnel || [],
      career_dev_center_personnel: backendData.career_dev_center_personnel || [],
      student_dev_welfare_personnel: backendData.student_dev_welfare_personnel || [],
    };
  },

  // Payload builder for submission
  buildPayload: (formData, tableData) => {
    return {
      academic_year: formData.academic_year,
      
      // Student counts (manual input)
      office_student_affairs_students_handled: formData.office_student_affairs_students_handled || null,
      guidance_office_students_handled: formData.guidance_office_students_handled || null,
      career_dev_center_students_handled: formData.career_dev_center_students_handled || null,
      student_dev_welfare_students_handled: formData.student_dev_welfare_students_handled || null,
      
      // Personnel data for each office
      office_student_affairs_personnel: tableData.office_student_affairs_personnel || [],
      guidance_office_personnel: tableData.guidance_office_personnel || [],
      career_dev_center_personnel: tableData.career_dev_center_personnel || [],
      student_dev_welfare_personnel: tableData.student_dev_welfare_personnel || [],
      
      request_notes: formData.request_notes || '',
    };
  }
};

/**
 * Get section by ID
 */
export const getMER2Section = (sectionId) => {
  return MER2_CONFIG.sections.find(s => s.id === sectionId);
};

/**
 * Get all table sections
 */
export const getMER2Tables = () => {
  return MER2_CONFIG.sections.filter(s => s.type === 'table');
};
