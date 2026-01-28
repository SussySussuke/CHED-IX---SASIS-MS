/**
 * Form 1: Student Welfare Services
 * Annexes: A, B, C, C-1, D
 * 
 * Note: Annex D (Student Handbook) configuration not yet implemented
 */

export const FORM1_ANNEXES = {
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

  'C-1': {
    title: 'LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES ECONOMIC ENTERPRISE DEVELOPMENT',
    endpoint: '/hei/annex-c-1',
    entityName: 'programs',
    entityLabel: 'Programs/Projects/Activities',
    addButtonText: 'Add Another Program',
    columns: [
      {
        data: 'title',
        title: 'Title of Programs/Projects/Activities',
        type: 'text',
        width: 250,
        placeholder: 'e.g., Entrepreneurship Workshop',
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
        placeholder: 'e.g., Economic Development Office',
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
  }
};
