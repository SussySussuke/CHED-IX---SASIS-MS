/**
 * Configuration for Annex A-O (HotTable-based annexes)
 * Each annex defines its specific columns, validation, endpoints, and metadata
 */

export const ANNEX_CONFIG = {
  A: {
    title: 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES INFORMATION AND ORIENTATION SERVICES',
    endpoint: '/hei/annex-a',
    entityName: 'programs',
    entityLabel: 'Programs/Projects/Activities',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title',
        title: 'Title of Programs/Projects/Activities',
        type: 'text',
        width: 250,
        placeholder: 'e.g., Mental Health Awareness Week',
        required: true
      },
      {
        data: 'venue',
        title: 'Venue',
        type: 'text',
        width: 150,
        placeholder: 'e.g., University Auditorium',
        required: true
      },
      {
        data: 'implementation_date',
        title: 'Date of Implementation',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'target_group',
        title: 'Target Group',
        type: 'text',
        width: 150,
        placeholder: 'e.g., Students, Faculty',
        required: true
      },
      {
        data: 'participants_online',
        title: 'Participants (Online)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'participants_face_to_face',
        title: 'Participants (Face-to-Face)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'organizer',
        title: 'Organizer',
        type: 'text',
        width: 150,
        placeholder: 'e.g., Student Affairs Office',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks (Optional)',
        type: 'text',
        width: 200,
        placeholder: 'Optional notes',
        required: false
      }
    ],
    requiredFields: ['title', 'venue', 'implementation_date', 'target_group', 'organizer'],
    dataMapper: (item) => ({
      title: item.title,
      venue: item.venue,
      implementation_date: item.implementation_date ? item.implementation_date.split('T')[0] : '',
      target_group: item.target_group,
      participants_online: item.participants_online,
      participants_face_to_face: item.participants_face_to_face,
      organizer: item.organizer,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      title: row[0],
      venue: row[1],
      implementation_date: row[2],
      target_group: row[3],
      participants_online: parseInt(row[4]) || 0,
      participants_face_to_face: parseInt(row[5]) || 0,
      organizer: row[6],
      remarks: row[7] || ''
    })
  },

  B: {
    title: 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES GUIDANCE AND COUNSELING SERVICE',
    endpoint: '/hei/annex-b',
    entityName: 'programs',
    entityLabel: 'Programs/Projects/Activities',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title',
        title: 'Title of Programs/Projects/Activities',
        type: 'text',
        width: 250,
        placeholder: 'e.g., Career Fair 2025',
        required: true
      },
      {
        data: 'venue',
        title: 'Venue',
        type: 'text',
        width: 150,
        placeholder: 'e.g., University Auditorium',
        required: true
      },
      {
        data: 'implementation_date',
        title: 'Date of Implementation',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'target_group',
        title: 'Target Group',
        type: 'text',
        width: 150,
        placeholder: 'e.g., Students, Faculty',
        required: true
      },
      {
        data: 'participants_online',
        title: 'Participants (Online)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'participants_face_to_face',
        title: 'Participants (Face-to-Face)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'organizer',
        title: 'Organizer',
        type: 'text',
        width: 150,
        placeholder: 'e.g., Career Services Office',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks (Optional)',
        type: 'text',
        width: 200,
        placeholder: 'Optional notes',
        required: false
      }
    ],
    requiredFields: ['title', 'venue', 'implementation_date', 'target_group', 'organizer'],
    dataMapper: (item) => ({
      title: item.title,
      venue: item.venue,
      implementation_date: item.implementation_date ? item.implementation_date.split('T')[0] : '',
      target_group: item.target_group,
      participants_online: item.participants_online,
      participants_face_to_face: item.participants_face_to_face,
      organizer: item.organizer,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      title: row[0],
      venue: row[1],
      implementation_date: row[2],
      target_group: row[3],
      participants_online: parseInt(row[4]) || 0,
      participants_face_to_face: parseInt(row[5]) || 0,
      organizer: row[6],
      remarks: row[7] || ''
    })
  },

  C: {
    title: 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES CAREER AND JOB PLACEMENT SERVICES',
    endpoint: '/hei/annex-c',
    entityName: 'programs',
    entityLabel: 'Programs/Projects/Activities',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title',
        title: 'Title of Programs/Projects/Activities',
        type: 'text',
        width: 250,
        placeholder: 'e.g., Job Fair 2025',
        required: true
      },
      {
        data: 'venue',
        title: 'Venue',
        type: 'text',
        width: 150,
        placeholder: 'e.g., University Auditorium',
        required: true
      },
      {
        data: 'implementation_date',
        title: 'Date of Implementation',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'participants_online',
        title: 'Participants (Online)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'participants_face_to_face',
        title: 'Participants (Face-to-Face)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'organizer',
        title: 'Organizer',
        type: 'text',
        width: 150,
        placeholder: 'e.g., Career Center',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks (Optional)',
        type: 'text',
        width: 200,
        placeholder: 'Optional notes',
        required: false
      }
    ],
    requiredFields: ['title', 'venue', 'implementation_date', 'organizer'],
    dataMapper: (item) => ({
      title: item.title,
      venue: item.venue,
      implementation_date: item.implementation_date ? item.implementation_date.split('T')[0] : '',
      participants_online: item.participants_online,
      participants_face_to_face: item.participants_face_to_face,
      organizer: item.organizer,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      title: row[0],
      venue: row[1],
      implementation_date: row[2],
      participants_online: parseInt(row[3]) || 0,
      participants_face_to_face: parseInt(row[4]) || 0,
      organizer: row[5],
      remarks: row[6] || ''
    })
  },

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
  },

  I: {
    title: 'LIST OF SCHOLARSHIPS/STUDENT FINANCIAL ASSISTANCE',
    endpoint: '/hei/annex-i',
    entityName: 'scholarships',
    entityLabel: 'Scholarships',
    addButtonText: 'Add Another Scholarship',
    columns: [
      {
        data: 'scholarship_name',
        title: 'Scholarship Name',
        type: 'text',
        width: 250,
        placeholder: 'Scholarship name',
        required: true
      },
      {
        data: 'type',
        title: 'Type',
        type: 'text',
        width: 150,
        placeholder: 'Type',
        required: true
      },
      {
        data: 'category_intended_beneficiaries',
        title: 'Category/Intended Beneficiaries',
        type: 'text',
        width: 250,
        placeholder: 'Category',
        required: true
      },
      {
        data: 'number_of_beneficiaries',
        title: 'Number of Beneficiaries',
        type: 'numeric',
        width: 150,
        placeholder: '0',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Remarks',
        required: false
      }
    ],
    requiredFields: ['scholarship_name', 'type', 'category_intended_beneficiaries', 'number_of_beneficiaries'],
    dataMapper: (item) => ({
      scholarship_name: item.scholarship_name,
      type: item.type,
      category_intended_beneficiaries: item.category_intended_beneficiaries,
      number_of_beneficiaries: item.number_of_beneficiaries,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      scholarship_name: row[0],
      type: row[1],
      category_intended_beneficiaries: row[2],
      number_of_beneficiaries: parseInt(row[3]) || 0,
      remarks: row[4] || null
    })
  },

  J: {
    title: 'HEALTH SERVICES',
    endpoint: '/hei/annex-j',
    entityName: 'programs',
    entityLabel: 'Health Service Programs',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title_of_program',
        title: 'Title of Program',
        type: 'text',
        width: 300,
        placeholder: 'Program title',
        required: true
      },
      {
        data: 'organizer',
        title: 'Organizer',
        type: 'text',
        width: 200,
        placeholder: 'Organizer',
        required: true
      },
      {
        data: 'participants_online',
        title: 'Participants (Online)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'participants_face_to_face',
        title: 'Participants (Face-to-Face)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Remarks',
        required: false
      }
    ],
    requiredFields: ['title_of_program', 'organizer'],
    dataMapper: (item) => ({
      title_of_program: item.title_of_program,
      organizer: item.organizer,
      participants_online: item.participants_online || 0,
      participants_face_to_face: item.participants_face_to_face || 0,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      title_of_program: row[0],
      organizer: row[1],
      participants_online: parseInt(row[2]) || 0,
      participants_face_to_face: parseInt(row[3]) || 0,
      remarks: row[4] || null
    })
  },

  K: {
    title: 'SAFETY AND SECURITY COMMITTEES',
    endpoint: '/hei/annex-k',
    entityName: 'committees',
    entityLabel: 'Committees',
    addButtonText: 'Add Another Committee',
    columns: [
      {
        data: 'committee_name',
        title: 'Committee Name',
        type: 'text',
        width: 250,
        placeholder: 'Committee name',
        required: true
      },
      {
        data: 'committee_head_name',
        title: 'Committee Head Name',
        type: 'text',
        width: 200,
        placeholder: 'Head name',
        required: true
      },
      {
        data: 'members_composition',
        title: 'Members Composition',
        type: 'text',
        width: 200,
        placeholder: 'Members',
        required: true
      },
      {
        data: 'programs_projects_activities_trainings',
        title: 'Programs/Projects/Activities/Trainings',
        type: 'text',
        width: 300,
        placeholder: 'Activities',
        required: false
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Remarks',
        required: false
      }
    ],
    requiredFields: ['committee_name', 'committee_head_name', 'members_composition'],
    dataMapper: (item) => ({
      committee_name: item.committee_name,
      committee_head_name: item.committee_head_name,
      members_composition: item.members_composition,
      programs_projects_activities_trainings: item.programs_projects_activities_trainings || '',
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      committee_name: row[0],
      committee_head_name: row[1],
      members_composition: row[2],
      programs_projects_activities_trainings: row[3] || null,
      remarks: row[4] || null
    })
  },

  L: {
    title: 'STUDENT HOUSING',
    endpoint: '/hei/annex-l',
    entityName: 'housing',
    entityLabel: 'Housing Facilities',
    addButtonText: 'Add Another Housing',
    hasSpecialValidation: true,  // Flag for special validation logic
    columns: [
      {
        data: 'housing_name',
        title: 'Housing Name',
        type: 'text',
        width: 250,
        placeholder: 'Housing name',
        required: true
      },
      {
        data: 'complete_address',
        title: 'Complete Address',
        type: 'text',
        width: 300,
        placeholder: 'Address',
        required: true
      },
      {
        data: 'house_manager_name',
        title: 'House Manager Name',
        type: 'text',
        width: 200,
        placeholder: 'Manager name',
        required: true
      },
      {
        data: 'male',
        title: 'Male',
        type: 'checkbox',
        width: 80,
        className: 'htCenter htMiddle',
        required: false
      },
      {
        data: 'female',
        title: 'Female',
        type: 'checkbox',
        width: 80,
        className: 'htCenter htMiddle',
        required: false
      },
      {
        data: 'coed',
        title: 'Co-ed',
        type: 'checkbox',
        width: 80,
        className: 'htCenter htMiddle',
        required: false
      },
      {
        data: 'others',
        title: 'Others (Specify)',
        type: 'text',
        width: 180,
        placeholder: 'Only if no checkbox selected',
        required: false,
        renderer: function(instance, td, row, col, prop, value, cellProperties) {
          const rowData = instance.getDataAtRow(row);
          const male = rowData[3];
          const female = rowData[4];
          const coed = rowData[5];

          if (male || female || coed) {
            td.style.backgroundColor = '#f3f4f6';
            td.style.color = '#9ca3af';
            cellProperties.readOnly = true;
          } else {
            td.style.backgroundColor = '';
            td.style.color = '';
            cellProperties.readOnly = false;
          }
          td.innerHTML = value || '';
          return td;
        }
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Remarks',
        required: false
      }
    ],
    requiredFields: ['housing_name', 'complete_address', 'house_manager_name'],
    dataMapper: (item) => ({
      housing_name: item.housing_name,
      complete_address: item.complete_address,
      house_manager_name: item.house_manager_name,
      male: item.male || false,
      female: item.female || false,
      coed: item.coed || false,
      others: item.others || '',
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      housing_name: row[0],
      complete_address: row[1],
      house_manager_name: row[2],
      male: !!row[3],
      female: !!row[4],
      coed: !!row[5],
      others: row[6] || null,
      remarks: row[7] || null
    }),
    // Special validation for L - at least one type must be selected
    customValidation: (row, index) => {
      const [housingName, completeAddress, houseManagerName, male, female, coed, others] = row;

      if (!male && !female && !coed && !others) {
        return `Row ${index + 1}: Please select at least one type (Male, Female, Co-ed, or specify Others)`;
      }
      return null;
    }
  },

  N: {
    title: 'CULTURE AND THE ARTS',
    endpoint: '/hei/annex-n',
    entityName: 'activities',
    entityLabel: 'Culture and Arts Activities',
    addButtonText: 'Add Another Activity',
    columns: [
      {
        data: 'title_of_activity',
        title: 'Title of Activity',
        type: 'text',
        width: 300,
        placeholder: 'Activity title',
        required: true
      },
      {
        data: 'implementation_date',
        title: 'Implementation Date',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'implementation_venue',
        title: 'Implementation Venue',
        type: 'text',
        width: 250,
        placeholder: 'Venue',
        required: true
      },
      {
        data: 'participants_online',
        title: 'Participants (Online)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 130,
        placeholder: '0',
        required: false
      },
      {
        data: 'participants_face_to_face',
        title: 'Participants (Face-to-Face)',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'organizer',
        title: 'Organizer',
        type: 'text',
        width: 200,
        placeholder: 'Organizer',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Remarks',
        required: false
      }
    ],
    requiredFields: ['title_of_activity', 'implementation_date', 'implementation_venue', 'organizer'],
    dataMapper: (item) => ({
      title_of_activity: item.title_of_activity,
      implementation_date: item.implementation_date ? item.implementation_date.split('T')[0] : '',
      implementation_venue: item.implementation_venue,
      participants_online: item.participants_online || 0,
      participants_face_to_face: item.participants_face_to_face || 0,
      organizer: item.organizer,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      title_of_activity: row[0],
      implementation_date: row[1],
      implementation_venue: row[2],
      participants_online: parseInt(row[3]) || 0,
      participants_face_to_face: parseInt(row[4]) || 0,
      organizer: row[5],
      remarks: row[6] || null
    })
  },

  O: {
    title: 'COMMUNITY INVOLVEMENT/OUTREACH PROGRAMS',
    endpoint: '/hei/annex-o',
    entityName: 'programs',
    entityLabel: 'Community Programs',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title_of_program',
        title: 'Title of Program',
        type: 'text',
        width: 300,
        placeholder: 'Program title',
        required: true
      },
      {
        data: 'date_conducted',
        title: 'Date Conducted',
        type: 'date',
        dateFormat: 'YYYY-MM-DD',
        correctFormat: true,
        width: 150,
        placeholder: 'YYYY-MM-DD',
        required: true
      },
      {
        data: 'number_of_beneficiaries',
        title: 'Number of Beneficiaries',
        type: 'numeric',
        width: 150,
        placeholder: '0',
        required: true
      },
      {
        data: 'type_of_community_service',
        title: 'Type of Community Service',
        type: 'text',
        width: 250,
        placeholder: 'Service type',
        required: true
      },
      {
        data: 'community_population_served',
        title: 'Community Population Served',
        type: 'text',
        width: 250,
        placeholder: 'Population served',
        required: true
      }
    ],
    requiredFields: ['title_of_program', 'date_conducted', 'number_of_beneficiaries', 'type_of_community_service', 'community_population_served'],
    dataMapper: (item) => ({
      title_of_program: item.title_of_program,
      date_conducted: item.date_conducted ? item.date_conducted.split('T')[0] : '',
      number_of_beneficiaries: item.number_of_beneficiaries,
      type_of_community_service: item.type_of_community_service,
      community_population_served: item.community_population_served
    }),
    submitMapper: (row) => ({
      title_of_program: row[0],
      date_conducted: row[1],
      number_of_beneficiaries: parseInt(row[2]) || 0,
      type_of_community_service: row[3],
      community_population_served: row[4]
    })
  }
};

/**
 * Mapping of annex codes to short names for display
 */
export const ANNEX_NAMES = {
  A: 'Information and Orientation Services',
  B: 'Guidance and Counseling Service',
  C: 'Career and Job Placement Services',
  D: 'Student Handbook',
  E: 'Student Organizations',
  F: 'Student Discipline',
  G: 'Student Publication',
  H: 'Admission Services',
  I: 'Scholarships/Financial Assistance',
  J: 'Health Services',
  K: 'Safety and Security Committees',
  L: 'Student Housing',
  M: 'Sports Development',
  N: 'Culture and the Arts',
  O: 'Community Involvement/Outreach',
};

/**
 * Get configuration for a specific annex
 * @param {string} annexLetter - Letter of the annex (A, B, C, etc.)
 * @returns {object} Configuration object for the annex
 */
export const getAnnexConfig = (annexLetter) => {
  const config = ANNEX_CONFIG[annexLetter.toUpperCase()];
  if (!config) {
    throw new Error(`No configuration found for Annex ${annexLetter}`);
  }
  return config;
};
