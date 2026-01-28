/**
 * Form 3: Institutional Student Programs and Services
 * Annexes: H, I, I-1, J, K, L, L-1, M, N, N-1, O
 * 
 * Note: Annex H (Admission Services) and M (Sports Development) configurations not yet implemented
 */

export const FORM3_ANNEXES = {
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

  'I-1': {
    title: 'FOOD SERVICES',
    endpoint: '/hei/annex-i-1',
    entityName: 'foodServices',
    entityLabel: 'Food Services',
    addButtonText: 'Add Another Food Service',
    columns: [
      {
        data: 'service_name',
        title: 'Service/Facility Name',
        type: 'text',
        width: 250,
        placeholder: 'Cafeteria name or food service provider',
        required: true
      },
      {
        data: 'service_type',
        title: 'Type of Service',
        type: 'text',
        width: 180,
        placeholder: 'e.g., Cafeteria, Canteen, Food Court',
        required: true
      },
      {
        data: 'operator_name',
        title: 'Operator',
        type: 'text',
        width: 200,
        placeholder: 'Operator name',
        required: true
      },
      {
        data: 'location',
        title: 'Location',
        type: 'text',
        width: 200,
        placeholder: 'Building/area location',
        required: true
      },
      {
        data: 'number_of_students_served',
        title: 'Students Served Daily',
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
        placeholder: 'Additional notes',
        required: false
      }
    ],
    requiredFields: ['service_name', 'service_type', 'operator_name', 'location'],
    dataMapper: (item) => ({
      service_name: item.service_name,
      service_type: item.service_type,
      operator_name: item.operator_name,
      location: item.location,
      number_of_students_served: item.number_of_students_served || 0,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      service_name: row[0],
      service_type: row[1],
      operator_name: row[2],
      location: row[3],
      number_of_students_served: parseInt(row[4]) || 0,
      remarks: row[5] || null
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

  'L-1': {
    title: 'FOREIGN/INTERNATIONAL STUDENTS SERVICES',
    endpoint: '/hei/annex-l-1',
    entityName: 'internationalServices',
    entityLabel: 'International Student Services',
    addButtonText: 'Add Another Service',
    columns: [
      {
        data: 'service_name',
        title: 'Service/Program Name',
        type: 'text',
        width: 250,
        placeholder: 'e.g., International Student Orientation',
        required: true
      },
      {
        data: 'service_type',
        title: 'Type of Service',
        type: 'text',
        width: 200,
        placeholder: 'e.g., Academic Support, Immigration, Cultural',
        required: true
      },
      {
        data: 'target_nationality',
        title: 'Target Nationality/Region',
        type: 'text',
        width: 200,
        placeholder: 'e.g., All International, ASEAN',
        required: true
      },
      {
        data: 'number_of_students_served',
        title: 'Students Served',
        type: 'numeric',
        numericFormat: { pattern: '0,0' },
        width: 150,
        placeholder: '0',
        required: false
      },
      {
        data: 'officer_in_charge',
        title: 'Officer-in-Charge',
        type: 'text',
        width: 200,
        placeholder: 'Name of coordinator',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Additional notes',
        required: false
      }
    ],
    requiredFields: ['service_name', 'service_type', 'target_nationality', 'officer_in_charge'],
    dataMapper: (item) => ({
      service_name: item.service_name,
      service_type: item.service_type,
      target_nationality: item.target_nationality,
      number_of_students_served: item.number_of_students_served || 0,
      officer_in_charge: item.officer_in_charge,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      service_name: row[0],
      service_type: row[1],
      target_nationality: row[2],
      number_of_students_served: parseInt(row[3]) || 0,
      officer_in_charge: row[4],
      remarks: row[5] || null
    })
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

  'N-1': {
    title: 'SPORTS DEVELOPMENT PROGRAM',
    endpoint: '/hei/annex-n-1',
    entityName: 'sportsPrograms',
    entityLabel: 'Sports Programs',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'program_title',
        title: 'Title of Program/Activity',
        type: 'text',
        width: 280,
        placeholder: 'e.g., Basketball Varsity Training',
        required: true
      },
      {
        data: 'sport_type',
        title: 'Sport/Activity Type',
        type: 'text',
        width: 180,
        placeholder: 'e.g., Basketball, Volleyball',
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
        data: 'venue',
        title: 'Venue',
        type: 'text',
        width: 200,
        placeholder: 'Location',
        required: true
      },
      {
        data: 'participants_count',
        title: 'Number of Participants',
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
        placeholder: 'Who organized it',
        required: true
      },
      {
        data: 'remarks',
        title: 'Remarks',
        type: 'text',
        width: 200,
        placeholder: 'Additional notes',
        required: false
      }
    ],
    requiredFields: ['program_title', 'sport_type', 'implementation_date', 'venue', 'organizer'],
    dataMapper: (item) => ({
      program_title: item.program_title,
      sport_type: item.sport_type,
      implementation_date: item.implementation_date ? item.implementation_date.split('T')[0] : '',
      venue: item.venue,
      participants_count: item.participants_count || 0,
      organizer: item.organizer,
      remarks: item.remarks || ''
    }),
    submitMapper: (row) => ({
      program_title: row[0],
      sport_type: row[1],
      implementation_date: row[2],
      venue: row[3],
      participants_count: parseInt(row[4]) || 0,
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
