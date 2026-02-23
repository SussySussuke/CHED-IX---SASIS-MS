/**
 * comparisonConfig.js
 *
 * Two shapes supported per section:
 *   A) fields: [{ field, label, type }]          — flat columns under year group
 *   B) groups: [{ groupLabel, fields: [...] }]   — nested sub-groups mirroring single-year form
 *
 * type: 'numeric' | 'boolean' | 'text'
 * GROUP LABELS mirror single-year form column group headers exactly.
 */

export const SECTION_COMPARISON_FIELDS = {

  '1A-Profile': {
    fetchable: true,
    fields: [
      { field: 'population_male',     label: 'Population (Male)',    type: 'numeric' },
      { field: 'population_female',   label: 'Population (Female)',  type: 'numeric' },
      { field: 'population_intersex', label: 'Population (Intersex)',type: 'numeric' },
      { field: 'population_total',    label: 'Population (Total)',   type: 'numeric' },
      { field: 'status',              label: 'Status',               type: 'text'    },
    ],
  },

  '1B-Personnel': {
    fetchable: true,
    fields: [
      { field: 'registered_guidance_counselors', label: 'Registered Guidance Counselors',  type: 'numeric' },
      { field: 'guidance_counseling',            label: 'Guidance & Counseling',           type: 'numeric' },
      { field: 'career_guidance_placement',      label: 'Career Guidance / Placement',     type: 'numeric' },
      { field: 'registrars',                     label: 'Registrars',                      type: 'numeric' },
      { field: 'admission_personnel',            label: 'Admission Personnel',             type: 'numeric' },
      { field: 'physician',                      label: 'Physician',                       type: 'numeric' },
      { field: 'dentist',                        label: 'Dentist',                         type: 'numeric' },
      { field: 'nurse',                          label: 'Nurse',                           type: 'numeric' },
      { field: 'other_medical_health',           label: 'Other Medical / Health Workers',  type: 'numeric' },
      { field: 'security_personnel',             label: 'Security Personnel',              type: 'numeric' },
      { field: 'food_service_personnel',         label: 'Food Service Personnel',          type: 'numeric' },
      { field: 'cultural_affairs',               label: 'Cultural Affairs',                type: 'numeric' },
      { field: 'sports_development',             label: 'Sports Development',              type: 'numeric' },
      { field: 'student_discipline',             label: 'Student Discipline',              type: 'numeric' },
      { field: 'scholarship_personnel',          label: 'Scholarship Personnel',           type: 'numeric' },
      { field: 'housing_residential',            label: 'Housing / Residential / Dorm',    type: 'numeric' },
      { field: 'pwd_special_needs',              label: 'PWD / Special Needs',             type: 'numeric' },
      { field: 'student_governance',             label: 'Student Governance',              type: 'numeric' },
      { field: 'student_publication',            label: 'Student Publication',             type: 'numeric' },
      { field: 'multi_faith',                    label: 'Multi-faith Services',            type: 'numeric' },
      { field: 'uncategorized',                  label: 'Uncategorized',                   type: 'numeric' },
      { field: 'total_personnel',                label: 'Total Personnel',                 type: 'numeric', clickable: true, categoryKey: 'total' },
    ],
  },

  '2-Info-Orientation': {
    fetchable: true,
    groups: [
      {
        groupLabel: 'Campus Orientation',
        fields: [
          { field: 'campus_orientation_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'campus_orientation' },
          { field: 'campus_orientation_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Gender-Sensitivity / VAWC',
        fields: [
          { field: 'gender_sensitivity_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'gender_sensitivity' },
          { field: 'gender_sensitivity_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Anti-Hazing',
        fields: [
          { field: 'anti_hazing_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'anti_hazing' },
          { field: 'anti_hazing_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Substance-Abuse Campaigns',
        fields: [
          { field: 'substance_abuse_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'substance_abuse' },
          { field: 'substance_abuse_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Sexual / Reproductive Health',
        fields: [
          { field: 'sexual_health_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'sexual_health' },
          { field: 'sexual_health_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Mental Health / Wellness',
        fields: [
          { field: 'mental_health_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'mental_health' },
          { field: 'mental_health_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Disaster Risk Management',
        fields: [
          { field: 'disaster_risk_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'disaster_risk' },
          { field: 'disaster_risk_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Miscellaneous',
        fields: [
          { field: 'uncategorized_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'uncategorized' },
          { field: 'uncategorized_students',   label: 'Students',   type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Total',
        fields: [
          { field: 'total_activities', label: 'Activities', type: 'numeric', clickable: true, categoryKey: 'total' },
          { field: 'total_students',   label: 'Students',   type: 'numeric' },
        ],
      },
    ],
  },

  '3-GuidanceCounselling': {
    fetchable: true,
    groups: [
      {
        groupLabel: 'Individual Inventory',
        fields: [
          { field: 'individual_inventory_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'individual_inventory' },
          { field: 'individual_inventory_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Counseling Service',
        fields: [
          { field: 'counseling_service_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'counseling_service' },
          { field: 'counseling_service_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Referral',
        fields: [
          { field: 'referral_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'referral' },
          { field: 'referral_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Testing / Appraisal',
        fields: [
          { field: 'testing_appraisal_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'testing_appraisal' },
          { field: 'testing_appraisal_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Follow-up',
        fields: [
          { field: 'follow_up_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'follow_up' },
          { field: 'follow_up_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Peer Facilitating Program/Activities',
        fields: [
          { field: 'peer_facilitating_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'peer_facilitating' },
          { field: 'peer_facilitating_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Others (please specify)',
        fields: [
          { field: 'others_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'others' },
          { field: 'others_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Total',
        fields: [
          { field: 'total_activities', label: 'No. of Activities', type: 'numeric', clickable: true, categoryKey: 'total' },
          { field: 'total_students',   label: 'No. of Students',   type: 'numeric' },
        ],
      },
    ],
  },

  '4-CareerJob': {
    fetchable: true,
    groups: [
      {
        groupLabel: 'Labor Empowerment and Career Guidance Conference for All Graduating Students (per RA 11551)',
        fields: [
          { field: 'labor_empowerment_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'labor_empowerment' },
          { field: 'labor_empowerment_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Job Fairs in Coordination with DOLE Regional Offices and PESOs',
        fields: [
          { field: 'job_fairs_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'job_fairs' },
          { field: 'job_fairs_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Registration of Graduating Students in PhilJobNet Portal',
        fields: [
          { field: 'phil_job_net_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'phil_job_net' },
          { field: 'phil_job_net_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Career Vocational and Employment Counseling',
        fields: [
          { field: 'career_counseling_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'career_counseling' },
          { field: 'career_counseling_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Others (please specify)',
        fields: [
          { field: 'others_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'others' },
          { field: 'others_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Total',
        fields: [
          { field: 'total_activities', label: 'No. of Activities', type: 'numeric', clickable: true, categoryKey: 'total' },
          { field: 'total_students',   label: 'No. of Students',   type: 'numeric' },
        ],
      },
    ],
  },

  '5-Health': {
    fetchable: true,
    groups: [
      {
        groupLabel: 'Annual Medical Check-up/Consultation',
        fields: [
          { field: 'medical_checkup_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'medical_checkup' },
          { field: 'medical_checkup_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Annual Dental Check-up/Consultation',
        fields: [
          { field: 'dental_checkup_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'dental_checkup' },
          { field: 'dental_checkup_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Seminar and Educational Tours',
        fields: [
          { field: 'seminar_educational_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'seminar_educational' },
          { field: 'seminar_educational_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Others (please specify)',
        fields: [
          { field: 'others_activities', label: 'No. of Activities Conducted',  type: 'numeric', clickable: true, categoryKey: 'others' },
          { field: 'others_students',   label: 'No. of Students Participated', type: 'numeric' },
        ],
      },
      {
        groupLabel: 'Total',
        fields: [
          { field: 'total_activities', label: 'No. of Activities', type: 'numeric', clickable: true, categoryKey: 'total' },
          { field: 'total_students',   label: 'No. of Students',   type: 'numeric' },
        ],
      },
    ],
  },

  '6-Admission': {
    fetchable: true,
    fields: [
      { field: 'admission_policy',   label: 'Admission Policy',      type: 'boolean' },
      { field: 'pwd_guidelines',     label: 'PWD Guidelines',        type: 'boolean' },
      { field: 'foreign_guidelines', label: 'Foreign Student Rules', type: 'boolean' },
      { field: 'drug_testing',       label: 'Drug Testing Required', type: 'boolean' },
      { field: 'entrance_exam',      label: 'Entrance Exam',         type: 'boolean' },
      { field: 'online_enrollment',  label: 'Online Enrolment',      type: 'boolean' },
    ],
  },

  '7-StudentDiscipline': {
    fetchable: true,
    fields: [
      { field: 'student_discipline_committee', label: 'Discipline Committee', type: 'boolean' },
      { field: 'procedure_mechanism',          label: 'Grievance Mechanism',  type: 'boolean' },
      { field: 'complaint_desk',               label: 'Complaint Desk',       type: 'boolean' },
    ],
  },

  '8-SocialCommunity': {
    fetchable: true,
    fields: [
      { field: 'total_activities',   label: 'Total Programs',      type: 'numeric' },
      { field: 'total_participants', label: 'Total Beneficiaries', type: 'numeric' },
    ],
  },

  '9-StudentOrganization': {
    fetchable: true,
    fields: [
      { field: 'total_organizations',   label: 'Total Organizations',  type: 'numeric' },
      { field: 'total_with_activities', label: 'Orgs with Activities', type: 'numeric' },
    ],
  },

  '10-Culture': {
    fetchable: true,
    fields: [
      { field: 'total_activities',   label: 'Total Activities',   type: 'numeric' },
      { field: 'total_participants', label: 'Total Participants', type: 'numeric' },
    ],
  },

  '11-Scholarship': {
    fetchable: true,
    fields: [
      { field: 'total_scholarships',  label: 'Total Scholarships',  type: 'numeric' },
      { field: 'total_beneficiaries', label: 'Total Beneficiaries', type: 'numeric' },
    ],
  },

  '12-SafetySecurity': {
    fetchable: true,
    fields: [
      { field: 'safety_security_committee',   label: 'Safety & Security Committee', type: 'boolean' },
      { field: 'disaster_risk_reduction',     label: 'Disaster Risk Reduction',     type: 'boolean' },
      { field: 'calamity_management',         label: 'Calamity Management',         type: 'boolean' },
      { field: 'crisis_management_committee', label: 'Crisis Management',           type: 'boolean' },
      { field: 'crisis_psychosocial',         label: 'Crisis Psychosocial Support', type: 'boolean' },
      { field: 'drug_free_committee',         label: 'Drug-Free Committee',         type: 'boolean' },
      { field: 'drug_education_trained',      label: 'Drug Education Trained',      type: 'boolean' },
    ],
  },

  '13-Dorm': {
    fetchable: true,
    fields: [
      { field: 'total_housing', label: 'Total Housing / Dorms', type: 'numeric' },
      { field: 'male_count',    label: 'Male Only',             type: 'numeric' },
      { field: 'female_count',  label: 'Female Only',           type: 'numeric' },
      { field: 'coed_count',    label: 'Co-ed',                 type: 'numeric' },
    ],
  },

  '14-SpecialNeeds-Stats': {
    fetchable: true,
    fields: [
      { field: 'pwd_enrollment',         label: 'PWD — Enrolled',                     type: 'numeric' },
      { field: 'pwd_graduates',          label: 'PWD — Graduates',                    type: 'numeric' },
      { field: 'ip_enrollment',          label: 'Indigenous People — Enrolled',       type: 'numeric' },
      { field: 'ip_graduates',           label: 'Indigenous People — Graduates',      type: 'numeric' },
      { field: 'solo_parent_enrollment', label: 'Solo Parent Dependents — Enrolled',  type: 'numeric' },
      { field: 'solo_parent_graduates',  label: 'Solo Parent Dependents — Graduates', type: 'numeric' },
    ],
  },
};

export default SECTION_COMPARISON_FIELDS;
