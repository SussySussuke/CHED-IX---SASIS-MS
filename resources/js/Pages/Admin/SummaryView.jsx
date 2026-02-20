import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import AcademicYearSelect from '../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../Components/Forms/FormSelector';
import RecordsModal from '../../Components/Modals/RecordsModal';
import { IoDocumentText, IoInformationCircle, IoGridOutline } from 'react-icons/io5';
import { summaryConfig } from '../../Config/summaryView/summaryConfig';
import {
  INFO_ORIENTATION_CATEGORY_LABELS,
  INFO_ORIENTATION_CATEGORY_KEYS,
} from '../../Config/summaryView/infoOrientationConfig';
import {
  PERSONNEL_CATEGORY_LABELS,
  PERSONNEL_CATEGORY_KEYS,
} from '../../Config/summaryView/personnelConfig';
import {
  GUIDANCE_COUNSELLING_CATEGORY_LABELS,
  GUIDANCE_COUNSELLING_CATEGORY_KEYS,
} from '../../Config/summaryView/guidanceCounsellingConfig';
import {
  CAREER_JOB_CATEGORY_LABELS,
  CAREER_JOB_CATEGORY_KEYS,
} from '../../Config/summaryView/careerJobConfig';
import {
  HEALTH_CATEGORY_LABELS,
  HEALTH_CATEGORY_KEYS,
} from '../../Config/summaryView/healthConfig';

// ─── Info-Orientation drilldown columns ───────────────────────────────────────
const DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title',
    field: 'title',
    flex: 2,
    minWidth: 250,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Venue',
    field: 'venue',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Date',
    field: 'implementation_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'Target Group',
    field: 'target_group',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Face-to-Face',
    field: 'participants_face_to_face',
    width: 120,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Online',
    field: 'participants_online',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Total',
    field: 'total_participants',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Source',
    field: 'program_type',
    width: 110,
    cellStyle: { textAlign: 'center' },
    cellRenderer: (params) => {
      if (!params.value) return <span className="text-gray-400">—</span>;
      return (
        <span className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {params.value === 'annex_a' ? 'Annex A' : 'Annex B'}
        </span>
      );
    },
  },
  {
    headerName: 'Category',
    field: 'assigned_categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: (params) => {
      const cats = params.value;
      if (!cats || cats.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cats.map((cat) => {
            const isMisc = cat === 'uncategorized';
            return (
              <span
                key={cat}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isMisc
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {INFO_ORIENTATION_CATEGORY_LABELS[cat] ?? cat}
              </span>
            );
          })}
        </div>
      );
    },
  },
];

// ─── Personnel drilldown columns ─────────────────────────────────────────────
const PERSONNEL_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Name',
    field: 'name_of_personnel',
    flex: 1,
    minWidth: 200,
    cellRenderer: (params) =>
      params.value
        ? <span className="font-medium">{params.value}</span>
        : <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Position / Designation',
    field: 'position_designation',
    flex: 1,
    minWidth: 220,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Office',
    field: 'office_type',
    width: 220,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Tenure / Appointment',
    field: 'tenure_nature_of_appointment',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Yrs in Office',
    field: 'years_in_office',
    width: 110,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value ?? '—',
  },
  {
    headerName: 'Highest Degree',
    field: 'qualification_highest_degree',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'License Type',
    field: 'license_no_type',
    width: 140,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'License Expiry',
    field: 'license_expiry_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
];

// ─── Category options for Info-Orientation recategorize dropdown ───────────────
const RECATEGORIZE_OPTIONS = INFO_ORIENTATION_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: INFO_ORIENTATION_CATEGORY_LABELS[key],
}));

// ─── Category options for Personnel recategorize dropdown ────────────────────
const PERSONNEL_RECATEGORIZE_OPTIONS = PERSONNEL_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: PERSONNEL_CATEGORY_LABELS[key],
}));

// ─── Guidance Counselling drilldown columns ───────────────────────────────────
const GUIDANCE_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title',
    field: 'title',
    flex: 2,
    minWidth: 250,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Venue',
    field: 'venue',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Date',
    field: 'implementation_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'Target Group',
    field: 'target_group',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Face-to-Face',
    field: 'participants_face_to_face',
    width: 120,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Online',
    field: 'participants_online',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Total',
    field: 'total_participants',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Category',
    field: 'assigned_categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: (params) => {
      const cats = params.value;
      if (!cats || cats.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cats.map((cat) => {
            const isOther = cat === 'others';
            return (
              <span
                key={cat}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isOther
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {GUIDANCE_COUNSELLING_CATEGORY_LABELS[cat] ?? cat}
              </span>
            );
          })}
        </div>
      );
    },
  },
];

// ─── Category options for Guidance Counselling recategorize dropdown ──────────
const GUIDANCE_RECATEGORIZE_OPTIONS = GUIDANCE_COUNSELLING_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: GUIDANCE_COUNSELLING_CATEGORY_LABELS[key],
}));

// ─── Career/Job drilldown columns ────────────────────────────────────────────
const CAREER_JOB_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title of Program/Activity',
    field: 'title',
    flex: 2,
    minWidth: 250,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Venue',
    field: 'venue',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Date',
    field: 'implementation_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'Face-to-Face',
    field: 'participants_face_to_face',
    width: 120,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Online',
    field: 'participants_online',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Total',
    field: 'total_participants',
    width: 100,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    flex: 1,
    minWidth: 150,
  },
  {
    headerName: 'Category',
    field: 'assigned_categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: (params) => {
      const cats = params.value;
      if (!cats || cats.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cats.map((cat) => {
            const isOther = cat === 'others';
            return (
              <span
                key={cat}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isOther
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {CAREER_JOB_CATEGORY_LABELS[cat] ?? cat}
              </span>
            );
          })}
        </div>
      );
    },
  },
];

// ─── Category options for Career/Job recategorize dropdown ────────────────────
const CAREER_JOB_RECATEGORIZE_OPTIONS = CAREER_JOB_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: CAREER_JOB_CATEGORY_LABELS[key],
}));

// ─── Health drilldown columns ─────────────────────────────────────────────────
const HEALTH_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Program/Activity Title',
    field: 'title_of_program',
    flex: 2,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    flex: 1,
    minWidth: 150,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'No. of Participants',
    field: 'number_of_participants',
    width: 150,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Remarks',
    field: 'remarks',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Category',
    field: 'assigned_categories',
    minWidth: 220,
    flex: 1,
    sortable: false,
    wrapText: true,
    autoHeight: true,
    cellRenderer: (params) => {
      const cats = params.value;
      if (!cats || cats.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 py-1">
          {cats.map((cat) => {
            const isOther = cat === 'others';
            return (
              <span
                key={cat}
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isOther
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                }`}
              >
                {HEALTH_CATEGORY_LABELS[cat] ?? cat}
              </span>
            );
          })}
        </div>
      );
    },
  },
];

// ─── Category options for Health recategorize dropdown ────────────────────────
const HEALTH_RECATEGORIZE_OPTIONS = HEALTH_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: HEALTH_CATEGORY_LABELS[key],
}));

// ─── Dorm drilldown columns ─────────────────────────────────────────────────
const DORM_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Housing / Facility Name',
    field: 'housing_name',
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Complete Address',
    field: 'complete_address',
    flex: 1,
    minWidth: 200,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'House Manager',
    field: 'house_manager_name',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Type',
    field: 'type',
    width: 130,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Remarks',
    field: 'remarks',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Student Organization drilldown columns ─────────────────────────────────
const STUDENT_ORG_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Organization Name',
    field: 'name_of_accredited',
    flex: 1,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Years of Existence',
    field: 'years_of_existence',
    width: 130,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right' },
    valueFormatter: (params) => params.value ?? '—',
  },
  {
    headerName: 'Accredited/Recognized Since',
    field: 'accredited_since',
    width: 160,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Faculty Adviser',
    field: 'faculty_adviser',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'President/Head & Officers',
    field: 'president_and_officers',
    flex: 1,
    minWidth: 200,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Specialization',
    field: 'specialization',
    width: 160,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Culture drilldown columns ────────────────────────────────────────────────
const CULTURE_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title of Activity',
    field: 'title_of_activity',
    flex: 2,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Date',
    field: 'implementation_date',
    width: 130,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'Venue',
    field: 'implementation_venue',
    flex: 1,
    minWidth: 150,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Total Participants',
    field: 'total_participants',
    width: 140,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Organizer',
    field: 'organizer',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Remarks',
    field: 'remarks',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Scholarship drilldown columns ────────────────────────────────────────────
const SCHOLARSHIP_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Scholarship / Financial Assistance',
    field: 'scholarship_name',
    flex: 2,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Type',
    field: 'type',
    width: 150,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Category / Intended Beneficiaries',
    field: 'category_intended_beneficiaries',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'No. of Beneficiaries',
    field: 'number_of_beneficiaries',
    width: 150,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Remarks',
    field: 'remarks',
    width: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Social Community drilldown columns ──────────────────────────────────────
const SOCIAL_COMMUNITY_DRILLDOWN_COLUMNS = [
  {
    headerName: 'Title of Program',
    field: 'title_of_program',
    flex: 2,
    minWidth: 220,
    wrapText: true,
    autoHeight: true,
  },
  {
    headerName: 'Date Conducted',
    field: 'date_conducted',
    width: 140,
    valueFormatter: (params) => {
      if (!params.value) return '—';
      return new Date(params.value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
  },
  {
    headerName: 'No. of Beneficiaries',
    field: 'number_of_beneficiaries',
    width: 160,
    type: 'numericColumn',
    cellStyle: { textAlign: 'right', fontWeight: 'bold' },
    valueFormatter: (params) => params.value?.toLocaleString() ?? '0',
  },
  {
    headerName: 'Type of Community Service',
    field: 'type_of_community_service',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
  {
    headerName: 'Community Population Served',
    field: 'community_population_served',
    flex: 1,
    minWidth: 180,
    cellRenderer: (params) =>
      params.value || <span className="text-gray-400">—</span>,
  },
];

// ─── Blank modal state ────────────────────────────────────────────────────────
const CLOSED_MODAL = {
  isOpen: false,
  heiId: null,
  heiName: '',
  category: '',
  zeroTargetCategory: null,
};

const SummaryView = ({
  summaries = [],
  availableYears = [],
  selectedYear = null,
}) => {
  const [activeSection, setActiveSection] = useState('1A-Profile');
  const [sectionData, setSectionData] = useState(summaries);
  const [loading, setLoading] = useState(false);

  // Separate drilldown state per section type
  const [infoDrilldown, setInfoDrilldown] = useState(CLOSED_MODAL);
  const [personnelDrilldown, setPersonnelDrilldown] = useState(CLOSED_MODAL);
  const [guidanceDrilldown, setGuidanceDrilldown] = useState(CLOSED_MODAL);
  const [careerJobDrilldown, setCareerJobDrilldown] = useState(CLOSED_MODAL);
  const [healthDrilldown, setHealthDrilldown] = useState(CLOSED_MODAL);
  const [socialCommunityDrilldown, setSocialCommunityDrilldown] = useState(CLOSED_MODAL);
  const [studentOrgDrilldown, setStudentOrgDrilldown] = useState(CLOSED_MODAL);
  const [cultureDrilldown, setCultureDrilldown] = useState(CLOSED_MODAL);
  const [scholarshipDrilldown, setScholarshipDrilldown] = useState(CLOSED_MODAL);
  const [dormDrilldown, setDormDrilldown] = useState(CLOSED_MODAL);

  // ── Year change ────────────────────────────────────────────────────────────
  const handleYearChange = (e) => {
    router.get('/admin/summary', { year: e.target.value }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // ── Section list ───────────────────────────────────────────────────────────
  const sections = summaryConfig.getSectionList();
  const sectionOptions = [
    {
      group: 'Summary Sections',
      options: sections.map((s) => ({ value: s.id, label: s.title })),
    },
  ];

  // ── Fetch data per section ─────────────────────────────────────────────────
  const handleSectionChange = async (sectionId) => {
    setActiveSection(sectionId);

    if (sectionId === '2-Info-Orientation' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/info-orientation?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '1B-Personnel' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/personnel?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '3-GuidanceCounselling' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/guidance-counselling?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '4-CareerJob' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/career-job?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '5-Health' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/health?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '6-Admission' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/admission?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '7-StudentDiscipline' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/student-discipline?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '8-SocialCommunity' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/social-community?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '9-StudentOrganization' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/student-organization?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '10-Culture' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/culture?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '11-Scholarship' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/scholarship?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '12-SafetySecurity' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/safety-security?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '13-Dorm' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/dorm?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else if (sectionId === '14-SpecialNeeds-Stats' && selectedYear) {
      setLoading(true);
      try {
        const res = await fetch(`/admin/summary/special-needs-stats?year=${selectedYear}`);
        const result = await res.json();
        setSectionData(result.data ?? []);
      } catch {
        setSectionData([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSectionData(summaries);
    }
  };

  useEffect(() => {
    const dynamicSections = ['2-Info-Orientation', '1B-Personnel', '3-GuidanceCounselling', '4-CareerJob', '5-Health', '6-Admission', '7-StudentDiscipline', '8-SocialCommunity', '9-StudentOrganization', '10-Culture', '11-Scholarship', '12-SafetySecurity', '13-Dorm', '14-SpecialNeeds-Stats'];
    if (!dynamicSections.includes(activeSection)) {
      setSectionData(summaries);
    }
  }, [summaries, activeSection]);

  useEffect(() => {
    if (activeSection === '2-Info-Orientation' && selectedYear) {
      handleSectionChange('2-Info-Orientation');
    } else if (activeSection === '1B-Personnel' && selectedYear) {
      handleSectionChange('1B-Personnel');
    } else if (activeSection === '3-GuidanceCounselling' && selectedYear) {
      handleSectionChange('3-GuidanceCounselling');
    } else if (activeSection === '4-CareerJob' && selectedYear) {
      handleSectionChange('4-CareerJob');
    } else if (activeSection === '5-Health' && selectedYear) {
      handleSectionChange('5-Health');
    } else if (activeSection === '6-Admission' && selectedYear) {
      handleSectionChange('6-Admission');
    } else if (activeSection === '7-StudentDiscipline' && selectedYear) {
      handleSectionChange('7-StudentDiscipline');
    } else if (activeSection === '8-SocialCommunity' && selectedYear) {
      handleSectionChange('8-SocialCommunity');
    } else if (activeSection === '9-StudentOrganization' && selectedYear) {
      handleSectionChange('9-StudentOrganization');
    } else if (activeSection === '10-Culture' && selectedYear) {
      handleSectionChange('10-Culture');
    } else if (activeSection === '11-Scholarship' && selectedYear) {
      handleSectionChange('11-Scholarship');
    } else if (activeSection === '12-SafetySecurity' && selectedYear) {
      handleSectionChange('12-SafetySecurity');
    } else if (activeSection === '13-Dorm' && selectedYear) {
      handleSectionChange('13-Dorm');
    } else if (activeSection === '14-SpecialNeeds-Stats' && selectedYear) {
      handleSectionChange('14-SpecialNeeds-Stats');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ── Info-Orientation click handlers ───────────────────────────────────────
  const handleActivityClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setInfoDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setInfoDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  };

  const closeInfoDrilldown = () => setInfoDrilldown(CLOSED_MODAL);

  const handleRecategorized = () => {
    handleSectionChange('2-Info-Orientation');
  };

  // ── Guidance Counselling click handlers ─────────────────────────────────────
  const handleGuidanceActivityClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setGuidanceDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setGuidanceDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  };

  const closeGuidanceDrilldown = () => setGuidanceDrilldown(CLOSED_MODAL);

  const handleGuidanceRecategorized = () => {
    handleSectionChange('3-GuidanceCounselling');
  };

  // ── Career/Job click handlers ──────────────────────────────────────────────
  const handleCareerJobActivityClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setCareerJobDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setCareerJobDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  };

  const closeCareerJobDrilldown = () => setCareerJobDrilldown(CLOSED_MODAL);

  const handleCareerJobRecategorized = () => {
    handleSectionChange('4-CareerJob');
  };

  // ── Health click handlers ──────────────────────────────────────────────────
  const handleHealthActivityClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setHealthDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setHealthDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  };

  const closeHealthDrilldown = () => setHealthDrilldown(CLOSED_MODAL);

  const handleHealthRecategorized = () => {
    handleSectionChange('5-Health');
  };

  // ── Personnel click handlers ───────────────────────────────────────────────
  const handlePersonnelCountClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    setPersonnelDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
  };

  const closePersonnelDrilldown = () => setPersonnelDrilldown(CLOSED_MODAL);

  const handlePersonnelRecategorized = () => {
    handleSectionChange('1B-Personnel');
  };

  // ── Social Community click handlers ───────────────────────────────────────
  const handleSocialCommunityClick = (heiId, heiName) => {
    setSocialCommunityDrilldown({ isOpen: true, heiId, heiName, category: '', zeroTargetCategory: null });
  };

  const closeSocialCommunityDrilldown = () => setSocialCommunityDrilldown(CLOSED_MODAL);

  // ── Student Organization click handlers ─────────────────────────────────
  const handleStudentOrgClick = (heiId, heiName) => {
    setStudentOrgDrilldown({ isOpen: true, heiId, heiName, category: '', zeroTargetCategory: null });
  };

  const closeStudentOrgDrilldown = () => setStudentOrgDrilldown(CLOSED_MODAL);

  // ── Culture click handlers ──────────────────────────────────────────────
  const handleCultureClick = (heiId, heiName) => {
    setCultureDrilldown({ isOpen: true, heiId, heiName, category: '', zeroTargetCategory: null });
  };

  const closeCultureDrilldown = () => setCultureDrilldown(CLOSED_MODAL);

  // ── Scholarship click handlers ─────────────────────────────────────────
  const handleScholarshipClick = (heiId, heiName) => {
    setScholarshipDrilldown({ isOpen: true, heiId, heiName, category: '', zeroTargetCategory: null });
  };

  const closeScholarshipDrilldown = () => setScholarshipDrilldown(CLOSED_MODAL);

  // ── Dorm click handlers ─────────────────────────────────────────────────
  const handleDormClick = (heiId, heiName) => {
    setDormDrilldown({ isOpen: true, heiId, heiName, category: '', zeroTargetCategory: null });
  };

  const closeDormDrilldown = () => setDormDrilldown(CLOSED_MODAL);

  // ── Column defs ────────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    if (activeSection === '2-Info-Orientation') {
      return summaryConfig.getSection(activeSection).getColumns(handleActivityClick);
    }
    if (activeSection === '1B-Personnel') {
      return summaryConfig.getSection(activeSection).getColumns(handlePersonnelCountClick);
    }
    if (activeSection === '3-GuidanceCounselling') {
      return summaryConfig.getSection(activeSection).getColumns(handleGuidanceActivityClick);
    }
    if (activeSection === '4-CareerJob') {
      return summaryConfig.getSection(activeSection).getColumns(handleCareerJobActivityClick);
    }
    if (activeSection === '5-Health') {
      return summaryConfig.getSection(activeSection).getColumns(handleHealthActivityClick);
    }
    if (activeSection === '8-SocialCommunity') {
      return summaryConfig.getSection(activeSection).getColumns(handleSocialCommunityClick);
    }
    if (activeSection === '9-StudentOrganization') {
      return summaryConfig.getSection(activeSection).getColumns(handleStudentOrgClick);
    }
    if (activeSection === '10-Culture') {
      return summaryConfig.getSection(activeSection).getColumns(handleCultureClick);
    }
    if (activeSection === '11-Scholarship') {
      return summaryConfig.getSection(activeSection).getColumns(handleScholarshipClick);
    }
    if (activeSection === '13-Dorm') {
      return summaryConfig.getSection(activeSection).getColumns(handleDormClick);
    }
    return summaryConfig.getSectionColumns(activeSection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ── Info-Orientation modal props ──────────────────────────────────────────
  const infoDrilldownProps = useMemo(() => {
    const { heiId, heiName, category, zeroTargetCategory } = infoDrilldown;
    const isTotal = category === 'total';
    const isMisc  = category === 'uncategorized';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/info-orientation/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    const totalFetchUrl = (!isTotal && heiId && selectedYear)
      ? `/admin/summary/info-orientation/${heiId}/total/evidence?year=${selectedYear}`
      : null;

    const subtitle = zeroTargetCategory
      ? `Academic Year ${selectedYear} — Assign records into: ${INFO_ORIENTATION_CATEGORY_LABELS[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${selectedYear}`;

    return {
      title: heiName,
      subtitle,
      categoryLabel: INFO_ORIENTATION_CATEGORY_LABELS[category] ?? category,
      isMiscellaneous: isMisc,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl: '/admin/summary/info-orientation/programs/category',
      columnDefs: DRILLDOWN_COLUMNS,
      categoryOptions: RECATEGORIZE_OPTIONS,
      recordTypeField: 'program_type',
      recordIdField: 'id',
    };
  }, [infoDrilldown, selectedYear]);

  // ── Guidance Counselling modal props ─────────────────────────────────────────
  const guidanceDrilldownProps = useMemo(() => {
    const { heiId, heiName, category, zeroTargetCategory } = guidanceDrilldown;
    const isTotal  = category === 'total';
    const isOthers = category === 'others';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/guidance-counselling/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    const totalFetchUrl = (!isTotal && heiId && selectedYear)
      ? `/admin/summary/guidance-counselling/${heiId}/total/evidence?year=${selectedYear}`
      : null;

    const subtitle = zeroTargetCategory
      ? `Academic Year ${selectedYear} — Assign records into: ${GUIDANCE_COUNSELLING_CATEGORY_LABELS[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${selectedYear}`;

    return {
      title:           heiName,
      subtitle,
      categoryLabel:   GUIDANCE_COUNSELLING_CATEGORY_LABELS[category] ?? category,
      isMiscellaneous: isOthers,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl: isTotal ? null : '/admin/summary/guidance-counselling/category',
      columnDefs:      GUIDANCE_DRILLDOWN_COLUMNS,
      categoryOptions: GUIDANCE_RECATEGORIZE_OPTIONS,
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [guidanceDrilldown, selectedYear]);

  // ── Career/Job modal props ────────────────────────────────────────────────
  const careerJobDrilldownProps = useMemo(() => {
    const { heiId, heiName, category, zeroTargetCategory } = careerJobDrilldown;
    const isTotal  = category === 'total';
    const isOthers = category === 'others';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/career-job/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    const totalFetchUrl = (!isTotal && heiId && selectedYear)
      ? `/admin/summary/career-job/${heiId}/total/evidence?year=${selectedYear}`
      : null;

    const subtitle = zeroTargetCategory
      ? `Academic Year ${selectedYear} — Assign records into: ${CAREER_JOB_CATEGORY_LABELS[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${selectedYear}`;

    return {
      title:           heiName,
      subtitle,
      categoryLabel:   CAREER_JOB_CATEGORY_LABELS[category] ?? category,
      isMiscellaneous: isOthers,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl: isTotal ? null : '/admin/summary/career-job/category',
      columnDefs:      CAREER_JOB_DRILLDOWN_COLUMNS,
      categoryOptions: CAREER_JOB_RECATEGORIZE_OPTIONS,
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [careerJobDrilldown, selectedYear]);

  // ── Health modal props ─────────────────────────────────────────────────────
  const healthDrilldownProps = useMemo(() => {
    const { heiId, heiName, category, zeroTargetCategory } = healthDrilldown;
    const isTotal  = category === 'total';
    const isOthers = category === 'others';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/health/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    const totalFetchUrl = (!isTotal && heiId && selectedYear)
      ? `/admin/summary/health/${heiId}/total/evidence?year=${selectedYear}`
      : null;

    const subtitle = zeroTargetCategory
      ? `Academic Year ${selectedYear} — Assign records into: ${HEALTH_CATEGORY_LABELS[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${selectedYear}`;

    return {
      title:           heiName,
      subtitle,
      categoryLabel:   HEALTH_CATEGORY_LABELS[category] ?? category,
      isMiscellaneous: isOthers,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl: '/admin/summary/health/category',
      columnDefs:      HEALTH_DRILLDOWN_COLUMNS,
      categoryOptions: HEALTH_RECATEGORIZE_OPTIONS,
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [healthDrilldown, selectedYear]);

  // ── Social Community modal props ──────────────────────────────────────────
  const socialCommunityDrilldownProps = useMemo(() => {
    const { heiId, heiName } = socialCommunityDrilldown;

    const fetchUrl = heiId && selectedYear
      ? `/admin/summary/social-community/${heiId}/evidence?year=${selectedYear}`
      : null;

    return {
      title:           heiName,
      subtitle:        `Academic Year ${selectedYear}`,
      categoryLabel:   'Community Programs',
      isMiscellaneous: false,
      isTotal:         true,
      fetchUrl,
      totalFetchUrl:   null,
      recategorizeUrl: null,
      columnDefs:      SOCIAL_COMMUNITY_DRILLDOWN_COLUMNS,
      categoryOptions: [],
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [socialCommunityDrilldown, selectedYear]);

  // ── Student Organization modal props ─────────────────────────────────
  const studentOrgDrilldownProps = useMemo(() => {
    const { heiId, heiName } = studentOrgDrilldown;

    const fetchUrl = heiId && selectedYear
      ? `/admin/summary/student-organization/${heiId}/evidence?year=${selectedYear}`
      : null;

    return {
      title:           heiName,
      subtitle:        `Academic Year ${selectedYear}`,
      categoryLabel:   'Student Organizations',
      isMiscellaneous: false,
      isTotal:         true,
      fetchUrl,
      totalFetchUrl:   null,
      recategorizeUrl: null,
      columnDefs:      STUDENT_ORG_DRILLDOWN_COLUMNS,
      categoryOptions: [],
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [studentOrgDrilldown, selectedYear]);

  // ── Culture modal props ──────────────────────────────────────────────────
  const cultureDrilldownProps = useMemo(() => {
    const { heiId, heiName } = cultureDrilldown;

    const fetchUrl = heiId && selectedYear
      ? `/admin/summary/culture/${heiId}/evidence?year=${selectedYear}`
      : null;

    return {
      title:           heiName,
      subtitle:        `Academic Year ${selectedYear}`,
      categoryLabel:   'Culture and Arts Activities',
      isMiscellaneous: false,
      isTotal:         true,
      fetchUrl,
      totalFetchUrl:   null,
      recategorizeUrl: null,
      columnDefs:      CULTURE_DRILLDOWN_COLUMNS,
      categoryOptions: [],
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [cultureDrilldown, selectedYear]);

  // ── Scholarship modal props ────────────────────────────────────────────
  const scholarshipDrilldownProps = useMemo(() => {
    const { heiId, heiName } = scholarshipDrilldown;

    const fetchUrl = heiId && selectedYear
      ? `/admin/summary/scholarship/${heiId}/evidence?year=${selectedYear}`
      : null;

    return {
      title:           heiName,
      subtitle:        `Academic Year ${selectedYear}`,
      categoryLabel:   'Scholarships & Financial Assistance',
      isMiscellaneous: false,
      isTotal:         true,
      fetchUrl,
      totalFetchUrl:   null,
      recategorizeUrl: null,
      columnDefs:      SCHOLARSHIP_DRILLDOWN_COLUMNS,
      categoryOptions: [],
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [scholarshipDrilldown, selectedYear]);

  // ── Dorm modal props ──────────────────────────────────────────────────
  const dormDrilldownProps = useMemo(() => {
    const { heiId, heiName } = dormDrilldown;

    const fetchUrl = heiId && selectedYear
      ? `/admin/summary/dorm/${heiId}/evidence?year=${selectedYear}`
      : null;

    return {
      title:           heiName,
      subtitle:        `Academic Year ${selectedYear}`,
      categoryLabel:   'Housing Facilities',
      isMiscellaneous: false,
      isTotal:         true,
      fetchUrl,
      totalFetchUrl:   null,
      recategorizeUrl: null,
      columnDefs:      DORM_DRILLDOWN_COLUMNS,
      categoryOptions: [],
      recordTypeField: 'id',
      recordIdField:   'id',
    };
  }, [dormDrilldown, selectedYear]);

  // ── Personnel modal props ─────────────────────────────────────────────────
  const personnelDrilldownProps = useMemo(() => {
    const { heiId, heiName, category } = personnelDrilldown;
    const isTotal = category === 'total';
    const isMisc  = category === 'uncategorized';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/personnel/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    // "View All" button — show when not already on total
    const totalFetchUrl = (!isTotal && heiId && selectedYear)
      ? `/admin/summary/personnel/${heiId}/total/evidence?year=${selectedYear}`
      : null;

    return {
      title: heiName,
      subtitle: `Academic Year ${selectedYear}`,
      categoryLabel: PERSONNEL_CATEGORY_LABELS[category] ?? category,
      isMiscellaneous: isMisc,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl: isTotal ? null : '/admin/summary/personnel/category',
      columnDefs: PERSONNEL_DRILLDOWN_COLUMNS,
      categoryOptions: PERSONNEL_RECATEGORIZE_OPTIONS,
      recordTypeField: 'id',
      recordIdField: 'id',
    };
  }, [personnelDrilldown, selectedYear]);

  const gridConfig = summaryConfig.gridDefaults;

  return (
    <AdminLayout title="Summary View">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Summary Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View all HEI summary submissions by academic year
          </p>
        </div>

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelector
            currentForm={activeSection}
            options={sectionOptions}
            mode="custom"
            onCustomChange={handleSectionChange}
            label="Section"
            icon={IoGridOutline}
            disabled={loading}
          />
          <AcademicYearSelect
            value={selectedYear ?? ''}
            onChange={handleYearChange}
            availableYears={availableYears}
            required={false}
            mode="view"
          />
        </div>

        {/* ── Data Display ── */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">Loading data…</span>
            </div>
          </div>
        ) : !selectedYear ? (
          <EmptyState
            icon={<IoInformationCircle className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Academic Year Selected"
            message="Please select an academic year to view summary data"
          />
        ) : sectionData.length === 0 ? (
          <EmptyState
            icon={<IoDocumentText className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Data Available"
            message={`No HEIs found for academic year ${selectedYear}`}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {activeSection === '2-Info-Orientation' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Click any activity count to view program details.
                    Yellow columns indicate activities that couldn't be automatically categorized.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '4-CareerJob' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Click any activity count to view program details from Annex C (Career and Job Placement Services).
                    Yellow column shows activities that couldn't be automatically matched to a service type.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '6-Admission' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Admission policy data from Annex H. Green = Yes, Red = No, — = not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '8-SocialCommunity' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Community involvement and outreach data from Annex O. Participants = total beneficiaries across all programs. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '9-StudentOrganization' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Student organization data from Annex E. ‘Activities Conducted’ = number of organizations that have listed programs/activities. Click any count to view organization details. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '10-Culture' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Culture and the arts data from Annex N. Click any count to view individual activity records. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '11-Scholarship' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Scholarship and financial assistance data from Annex I. Click any count to view individual scholarship records. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '12-SafetySecurity' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Safety and security committee data from Annex K. Presence is determined by keyword matching on committee names submitted by each HEI. Green = Yes, Red = No, — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '13-Dorm' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Student housing data from Annex L. Male/Female/Co-ed counts reflect exclusive type only (Co-ed includes facilities marked co-ed regardless of other flags). Click any count to view individual facility records. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '14-SpecialNeeds-Stats' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Students with special needs statistics from Annex M, Table 1. Figures shown are the Sub-Total for each category for the selected academic year only. — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '7-StudentDiscipline' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Student Discipline data from Annex F. Green = Yes (field is filled), Red = No (field is empty), — = HEI has not submitted.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '5-Health' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Click any activity count to view program details from Annex J (Health Services).
                    Yellow column shows activities that couldn't be automatically matched to a service type.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '3-GuidanceCounselling' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Click any activity count to view program details from Annex B (Guidance and Counseling Service).
                    Yellow column shows activities that couldn't be automatically matched to a service type.
                  </p>
                </div>
              </div>
            )}

            {activeSection === '1B-Personnel' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}
                    Counts are derived from <strong>position/designation</strong> keyword matching on MER2 submissions.
                    Yellow column shows personnel whose position didn't match any category.
                    Click any count to view the individual personnel records.
                  </p>
                </div>
              </div>
            )}

            <AGGridViewer
              rowData={sectionData}
              columnDefs={columnDefs}
              height={gridConfig.height}
              paginationPageSize={gridConfig.paginationPageSize}
              paginationPageSizeSelector={gridConfig.paginationPageSizeSelector}
              enableQuickFilter={gridConfig.enableQuickFilter}
              quickFilterPlaceholder={gridConfig.quickFilterPlaceholder}
            />
          </div>
        )}
      </div>

      {/* ── Info-Orientation Drilldown Modal ── */}
      <RecordsModal
        {...infoDrilldownProps}
        isOpen={infoDrilldown.isOpen}
        onClose={closeInfoDrilldown}
        onRecategorized={handleRecategorized}
      />

      {/* ── Personnel Drilldown Modal ── */}
      <RecordsModal
        {...personnelDrilldownProps}
        isOpen={personnelDrilldown.isOpen}
        onClose={closePersonnelDrilldown}
        onRecategorized={handlePersonnelRecategorized}
      />

      {/* ── Guidance Counselling Drilldown Modal ── */}
      <RecordsModal
        {...guidanceDrilldownProps}
        isOpen={guidanceDrilldown.isOpen}
        onClose={closeGuidanceDrilldown}
        onRecategorized={handleGuidanceRecategorized}
      />

      {/* ── Career/Job Drilldown Modal ── */}
      <RecordsModal
        {...careerJobDrilldownProps}
        isOpen={careerJobDrilldown.isOpen}
        onClose={closeCareerJobDrilldown}
        onRecategorized={handleCareerJobRecategorized}
      />

      {/* ── Health Drilldown Modal ── */}
      <RecordsModal
        {...healthDrilldownProps}
        isOpen={healthDrilldown.isOpen}
        onClose={closeHealthDrilldown}
        onRecategorized={handleHealthRecategorized}
      />

      {/* ── Social Community Drilldown Modal ── */}
      <RecordsModal
        {...socialCommunityDrilldownProps}
        isOpen={socialCommunityDrilldown.isOpen}
        onClose={closeSocialCommunityDrilldown}
      />

      {/* ── Student Organization Drilldown Modal ── */}
      <RecordsModal
        {...studentOrgDrilldownProps}
        isOpen={studentOrgDrilldown.isOpen}
        onClose={closeStudentOrgDrilldown}
      />

      {/* ── Culture Drilldown Modal ── */}
      <RecordsModal
        {...cultureDrilldownProps}
        isOpen={cultureDrilldown.isOpen}
        onClose={closeCultureDrilldown}
      />

      {/* ── Scholarship Drilldown Modal ── */}
      <RecordsModal
        {...scholarshipDrilldownProps}
        isOpen={scholarshipDrilldown.isOpen}
        onClose={closeScholarshipDrilldown}
      />

      {/* ── Dorm Drilldown Modal ── */}
      <RecordsModal
        {...dormDrilldownProps}
        isOpen={dormDrilldown.isOpen}
        onClose={closeDormDrilldown}
      />
    </AdminLayout>
  );
};

export default SummaryView;
