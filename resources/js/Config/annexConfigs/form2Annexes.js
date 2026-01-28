/**
 * Form 2: Student Welfare Services (continued)
 * Annexes: E, F, G
 * 
 * Note: Annex G (Student Publication) configuration not yet implemented
 */

export const FORM2_ANNEXES = {
  E: {
    title: 'LIST OF ACCREDITED/ RECOGNIZED/ AUTHORIZED STUDENT ORGANIZATIONS/ COUNCIL/ GOVERNMENT AND STUDENT ACTIVITIES',
    endpoint: '/hei/annex-e',
    entityName: 'organizations',
    entityLabel: 'Student Organizations',
    addButtonText: 'Add Another Organization',
    columns: [
      {
        data: 'name_of_accredited',
        title: 'Name of Accredited/Recognized/Authorized',
        type: 'text',
        width: 250,
        placeholder: 'Student Organization, Council, etc.',
        required: true
      },
      {
        data: 'years_of_existence',
        title: 'No. of Years of Existence',
        type: 'numeric',
        numericFormat: { pattern: '0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'accredited_since',
        title: 'Accredited/Recognized Since',
        type: 'text',
        width: 150,
        placeholder: 'e.g., 2020',
        required: true
      },
      {
        data: 'faculty_adviser',
        title: 'Faculty Adviser (if applicable)',
        type: 'text',
        width: 180,
        placeholder: 'Optional',
        required: false
      },
      {
        data: 'president_and_officers',
        title: 'President/Head and Officers',
        type: 'text',
        width: 250,
        placeholder: 'use additional sheet if necessary',
        required: true
      },
      {
        data: 'specialization',
        title: 'Specialization',
        type: 'text',
        width: 180,
        placeholder: 'Drug Education, Academic, etc.',
        required: true
      },
      {
        data: 'fee_collected',
        title: 'Fee Collected (if authorized)',
        type: 'text',
        width: 150,
        placeholder: 'Optional',
        required: false
      },
      {
        data: 'programs_projects_activities',
        title: 'Programs/Projects/Activities Undertaken',
        type: 'text',
        width: 250,
        placeholder: 'as approved and monitored by HEI',
        required: true
      }
    ],
    requiredFields: ['name_of_accredited', 'accredited_since', 'president_and_officers', 'specialization', 'programs_projects_activities'],
    dataMapper: (item) => ({
      name_of_accredited: item.name_of_accredited,
      years_of_existence: item.years_of_existence,
      accredited_since: item.accredited_since,
      faculty_adviser: item.faculty_adviser || '',
      president_and_officers: item.president_and_officers,
      specialization: item.specialization,
      fee_collected: item.fee_collected || '',
      programs_projects_activities: item.programs_projects_activities
    }),
    submitMapper: (row) => ({
      name_of_accredited: row[0],
      years_of_existence: parseInt(row[1]) || 0,
      accredited_since: row[2],
      faculty_adviser: row[3] || '',
      president_and_officers: row[4],
      specialization: row[5],
      fee_collected: row[6] || '',
      programs_projects_activities: row[7]
    })
  },

  F: {
    title: 'LIST OF PROGRAMS/PROJECTS/ACTIVITIES STUDENT DISCIPLINE',
    endpoint: '/hei/annex-f',
    entityName: 'activities',
    entityLabel: 'Activities',
    addButtonText: 'Add Another Activity',
    hasFormFields: true,  // Flag to indicate additional form fields
    formFields: [
      {
        key: 'procedure_mechanism',
        label: 'Procedure/mechanism to address student grievance',
        type: 'text',
        placeholder: 'Enter procedure/mechanism',
        maxLength: 255
      },
      {
        key: 'complaint_desk',
        label: 'Complaint desk',
        type: 'text',
        placeholder: 'Enter complaint desk',
        maxLength: 255
      }
    ],
    columns: [
      {
        data: 'activity',
        title: 'Activity',
        type: 'text',
        width: 300,
        placeholder: 'Activity name',
        required: true
      },
      {
        data: 'date',
        title: 'Date',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'status',
        title: 'Status',
        type: 'text',
        width: 200,
        placeholder: 'Status',
        required: true
      }
    ],
    requiredFields: ['activity', 'date', 'status'],
    dataMapper: (item) => ({
      activity: item.activity,
      date: item.date ? item.date.split('T')[0] : '',
      status: item.status
    }),
    submitMapper: (row) => ({
      activity: row[0],
      date: row[1],
      status: row[2]
    })
  }
};
