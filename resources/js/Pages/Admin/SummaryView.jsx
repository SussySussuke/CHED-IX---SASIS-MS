import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import AcademicYearSelect from '../../Components/Forms/AcademicYearSelect';
import FormSelector from '../../Components/Forms/FormSelector';
import RecordsModal from '../../Components/Modals/RecordsModal';
import { IoDocumentText, IoInformationCircle, IoGridOutline } from 'react-icons/io5';
import {
  summaryConfig,
  SECTION_DRILLDOWN_REGISTRY,
  SECTION_FETCH_URLS,
  SECTION_TIPS,
} from '../../Config/summaryView/summaryConfig';
import {
  INFO_ORIENTATION_CATEGORY_LABELS,
} from '../../Config/summaryView/infoOrientationConfig';
import {
  PERSONNEL_CATEGORY_LABELS,
} from '../../Config/summaryView/personnelConfig';
import {
  GUIDANCE_COUNSELLING_CATEGORY_LABELS,
} from '../../Config/summaryView/guidanceCounsellingConfig';
import {
  CAREER_JOB_CATEGORY_LABELS,
} from '../../Config/summaryView/careerJobConfig';
import {
  HEALTH_CATEGORY_LABELS,
} from '../../Config/summaryView/healthConfig';

// ─── Category label resolvers per section ─────────────────────────────────────
const CATEGORY_LABEL_MAP = {
  '2-Info-Orientation':    INFO_ORIENTATION_CATEGORY_LABELS,
  '1B-Personnel':          PERSONNEL_CATEGORY_LABELS,
  '3-GuidanceCounselling': GUIDANCE_COUNSELLING_CATEGORY_LABELS,
  '4-CareerJob':           CAREER_JOB_CATEGORY_LABELS,
  '5-Health':              HEALTH_CATEGORY_LABELS,
};

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
  const [drilldown, setDrilldown] = useState(CLOSED_MODAL);

  // ── Year change ────────────────────────────────────────────────────────────
  const handleYearChange = (e) => {
    router.get('/admin/summary', { year: e.target.value }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // ── Fetch section data ─────────────────────────────────────────────────────
  const fetchSectionData = useCallback(async (sectionId) => {
    const fetchUrl = SECTION_FETCH_URLS[sectionId];
    if (!fetchUrl || !selectedYear) {
      setSectionData(summaries);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${fetchUrl}?year=${selectedYear}`);
      const result = await res.json();
      setSectionData(result.data ?? []);
    } catch {
      setSectionData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, summaries]);

  // ── Section change ─────────────────────────────────────────────────────────
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    fetchSectionData(sectionId);
  };

  // Sync static sections when summaries prop changes (e.g. year navigation)
  useEffect(() => {
    if (!SECTION_FETCH_URLS[activeSection]) {
      setSectionData(summaries);
    }
  }, [summaries, activeSection]);

  // Re-fetch dynamic sections when selectedYear changes
  useEffect(() => {
    if (SECTION_FETCH_URLS[activeSection]) {
      fetchSectionData(activeSection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ── Generic drilldown open — used by sections with category-based modals ──
  const openDrilldown = useCallback((category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  }, []);

  // ── Simple drilldown open — sections with no category (just heiId/heiName) ─
  const openSimpleDrilldown = useCallback((heiId, heiName) => {
    setDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: null });
  }, []);

  const closeDrilldown = useCallback(() => setDrilldown(CLOSED_MODAL), []);

  const handleRecategorized = useCallback(() => {
    fetchSectionData(activeSection);
  }, [activeSection, fetchSectionData]);

  // ── Column defs ────────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    const section = summaryConfig.getSection(activeSection);
    if (!section) return [];
    if (!section.getColumns) return section.columns ?? [];

    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    if (!registry) return section.getColumns();

    // Simple sections (no category param)
    const simpleClick = ['8-SocialCommunity', '9-StudentOrganization', '10-Culture', '11-Scholarship', '13-Dorm'];
    if (simpleClick.includes(activeSection)) {
      return section.getColumns(openSimpleDrilldown);
    }

    return section.getColumns(openDrilldown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ── RecordsModal props derived from active section + drilldown state ───────
  const modalProps = useMemo(() => {
    if (!drilldown.isOpen) return null;
    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    if (!registry) return null;

    const { heiId, heiName, category, zeroTargetCategory } = drilldown;
    const isTotal = category === 'total';
    const isMisc  = registry.miscKey ? category === registry.miscKey : false;

    const fetchUrl = heiId && selectedYear
      ? registry.fetchPath(heiId, category, selectedYear)
      : null;

    const totalFetchUrl = (!isTotal && heiId && selectedYear && registry.totalFetchPath)
      ? registry.totalFetchPath(heiId, selectedYear)
      : null;

    const labelMap = CATEGORY_LABEL_MAP[activeSection];
    const categoryLabel = labelMap ? (labelMap[category] ?? category) : 'Records';

    const subtitle = zeroTargetCategory
      ? `Academic Year ${selectedYear} — Assign records into: ${labelMap?.[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${selectedYear}`;

    // Personnel: no recategorize on "total" view
    const recategorizeUrl = (isTotal && activeSection === '1B-Personnel')
      ? null
      : registry.recategorizeUrl;

    return {
      title:           heiName,
      subtitle,
      categoryLabel,
      isMiscellaneous: isMisc,
      isTotal,
      fetchUrl,
      totalFetchUrl,
      recategorizeUrl,
      columnDefs:      registry.columnDefs,
      categoryOptions: registry.categoryOptions,
      recordTypeField: registry.recordTypeField,
      recordIdField:   registry.recordIdField,
    };
  }, [drilldown, activeSection, selectedYear]);

  // ── Active tip text ────────────────────────────────────────────────────────
  const activeTip = useMemo(() => {
    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    return registry?.tip ?? SECTION_TIPS[activeSection] ?? null;
  }, [activeSection]);

  // ── Section list for selector ──────────────────────────────────────────────
  const sections = summaryConfig.getSectionList();
  const sectionOptions = [
    {
      group: 'Summary Sections',
      options: sections.map((s) => ({ value: s.id, label: s.title })),
    },
  ];

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
            {/* ── Section tip banner ── */}
            {activeTip && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                <div className="flex items-start gap-3">
                  <IoInformationCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Tip:</span>{' '}{activeTip}
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

      {/* ── Drilldown Modal ── */}
      {modalProps && (
        <RecordsModal
          {...modalProps}
          isOpen={drilldown.isOpen}
          onClose={closeDrilldown}
          onRecategorized={handleRecategorized}
        />
      )}
    </AdminLayout>
  );
};

export default SummaryView;
