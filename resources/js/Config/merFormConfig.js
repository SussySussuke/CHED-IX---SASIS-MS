/**
 * Configuration for MER Forms 1-3
 * Defines metadata, services, and annex mappings for each form
 */

export const MER_FORMS = {
  1: {
    formNumber: 1,
    title: 'Form 1: Student Welfare Services',
    subtitle: 'Annexes A-D: Information & Orientation, Guidance & Counseling, Career & Job Placement, Economic Enterprise Development, Student Handbook',
    sectionTitle: 'B. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer/form1',
    services: [
      {
        name: '1. Information and Orientation Service',
        annexType: 'annex_a',
        annexLetter: 'A',
      },
      {
        name: '2. Guidance and Counseling Services',
        annexType: 'annex_b',
        annexLetter: 'B',
      },
      {
        name: '3. Career and Job Placement Services',
        annexType: 'annex_c',
        annexLetter: 'C',
      },
      {
        name: '4. Economic Enterprise Development',
        annexType: 'annex_c_1',
        annexLetter: 'C-1',
      },
      {
        name: '5. Student Handbook Development',
        annexType: 'annex_d',
        annexLetter: 'D',
      },
    ],
  },
  2: {
    formNumber: 2,
    title: 'Form 2: Student Welfare Services',
    subtitle: 'Annexes E-G: Student Activities, Student Discipline, Student Publication/Yearbook',
    sectionTitle: 'C. STUDENT WELFARE SERVICES',
    endpoint: '/admin/mer/form2',
    services: [
      {
        name: '1. Student Activities',
        annexType: 'annex_e',
        annexLetter: 'E',
      },
      {
        name: '5. Student Discipline',
        annexType: 'annex_f',
        annexLetter: 'F',
      },
      {
        name: '6. Student Publication/Yearbook',
        annexType: 'annex_g',
        annexLetter: 'G',
      },
    ],
  },
  3: {
    formNumber: 3,
    title: 'Form 3: Institutional Student Programs and Services',
    subtitle: 'Annexes H-O: Admission, Scholarships, Health, Safety, Housing, Special Needs, Cultural Arts, Community Programs',
    sectionTitle: 'C. INSTITUTIONAL STUDENT PROGRAMS AND SERVICES',
    endpoint: '/admin/mer/form3',
    services: [
      {
        name: '1. Admission Services',
        annexType: 'annex_h',
        annexLetter: 'H',
      },
      {
        name: '2. Scholarships and Financial Assistance',
        annexType: 'annex_i',
        annexLetter: 'I',
      },
      {
        name: '4. Health Services',
        annexType: 'annex_j',
        annexLetter: 'J',
      },
      {
        name: '5. Safety and Security Services',
        annexType: 'annex_k',
        annexLetter: 'K',
      },
      {
        name: '6. Student Housing and Residential Services',
        annexType: 'annex_l',
        annexLetter: 'L',
      },
      {
        name: '8. Services for Students with Special Needs and Persons with Disabilities',
        annexType: 'annex_m',
        annexLetter: 'M',
      },
      {
        name: '9. Cultural and Arts Program',
        annexType: 'annex_n',
        annexLetter: 'N',
      },
      {
        name: '11. Social and Community Involvement Programs',
        annexType: 'annex_o',
        annexLetter: 'O',
      },
    ],
  },
};

/**
 * Get configuration for a specific form
 */
export const getMERFormConfig = (formNumber) => {
  return MER_FORMS[formNumber];
};
