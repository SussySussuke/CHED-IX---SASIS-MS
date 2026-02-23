import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import AGGridViewer from '../../Components/Common/AGGridViewer';
import EmptyState from '../../Components/Common/EmptyState';
import FormSelector from '../../Components/Forms/FormSelector';
import YearMultiSelect from '../../Components/Forms/YearMultiSelect';
import RecordsModal from '../../Components/Modals/RecordsModal';
import { IoDocumentText, IoInformationCircle, IoGridOutline, IoGitCompare } from 'react-icons/io5';
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
import {
  buildComparisonRows,
  buildComparisonColumns,
} from '../../Config/summaryView/comparisonUtils';

// Category label resolvers per section
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
  const [sectionData, setSectionData]     = useState(summaries);
  const [loading, setLoading]             = useState(false);
  const [drilldown, setDrilldown]         = useState(CLOSED_MODAL);

  // selectedYears drives everything. Seeded from Inertia selectedYear on mount.
  const [selectedYears, setSelectedYears] = useState(
    selectedYear ? [selectedYear] : []
  );

  // Cache of fetched data per year: { [year]: rowArray }
  const dataCache = useRef({});

  const isComparing = selectedYears.length > 1;
  const primaryYear = selectedYears[selectedYears.length - 1] ?? null;

  // Sync selectedYears when Inertia navigates (browser back/forward)
  useEffect(() => {
    if (selectedYear && !selectedYears.includes(selectedYear)) {
      setSelectedYears([selectedYear]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // Core fetch: loads all selected years for the active section.
  // All sections now have a SECTION_FETCH_URLS entry (including 1A-Profile).
  // No router.get() here — Inertia navigation would refresh the summaries prop
  // and cause re-render loops that wipe comparison data.
  const fetchAllSelectedYears = useCallback(async (sectionId, years) => {
    if (years.length === 0) {
      setSectionData([]);
      return;
    }

    const fetchUrl = SECTION_FETCH_URLS[sectionId];
    if (!fetchUrl) {
      setSectionData([]);
      return;
    }

    setLoading(true);
    dataCache.current = {};

    try {
      const results = await Promise.all(
        years.map(async (year) => {
          const res    = await fetch(`${fetchUrl}?year=${year}`);
          const result = await res.json();
          return { year, rows: result.data ?? [] };
        })
      );

      for (const { year, rows } of results) {
        dataCache.current[year] = rows;
      }

      if (years.length === 1) {
        setSectionData(dataCache.current[years[0]] ?? []);
      } else {
        setSectionData(buildComparisonRows(dataCache.current, years));
      }
    } catch {
      setSectionData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Section change — just update state; the useEffect handles the fetch
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Year selection change — local state only, no Inertia navigation
  const handleYearsChange = (years) => {
    setSelectedYears(years);
  };

  // Re-fetch whenever years or section changes
  useEffect(() => {
    fetchAllSelectedYears(activeSection, selectedYears);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYears, activeSection]);

  // Drilldown (disabled in comparison mode)
  const openDrilldown = useCallback((category, heiId, heiName, count) => {
    if (isComparing) return;
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  }, [isComparing]);

  const openSimpleDrilldown = useCallback((heiId, heiName) => {
    if (isComparing) return;
    setDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: null });
  }, [isComparing]);

  const closeDrilldown = useCallback(() => setDrilldown(CLOSED_MODAL), []);

  const handleRecategorized = useCallback(() => {
    fetchAllSelectedYears(activeSection, selectedYears);
  }, [activeSection, selectedYears, fetchAllSelectedYears]);

  // Column defs
  const columnDefs = useMemo(() => {
    if (isComparing) {
      return buildComparisonColumns(activeSection, selectedYears);
    }

    const section = summaryConfig.getSection(activeSection);
    if (!section) return [];
    if (!section.getColumns) return section.columns ?? [];

    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    if (!registry) return section.getColumns();

    const simpleClick = ['8-SocialCommunity', '9-StudentOrganization', '10-Culture', '11-Scholarship', '13-Dorm'];
    if (simpleClick.includes(activeSection)) {
      return section.getColumns(openSimpleDrilldown);
    }

    return section.getColumns(openDrilldown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, isComparing, selectedYears]);

  // RecordsModal props
  const modalProps = useMemo(() => {
    if (!drilldown.isOpen || isComparing) return null;
    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    if (!registry) return null;

    const { heiId, heiName, category, zeroTargetCategory } = drilldown;
    const isTotal = category === 'total';
    const isMisc  = registry.miscKey ? category === registry.miscKey : false;

    const fetchUrl = heiId && primaryYear
      ? registry.fetchPath(heiId, category, primaryYear)
      : null;

    const totalFetchUrl = (!isTotal && heiId && primaryYear && registry.totalFetchPath)
      ? registry.totalFetchPath(heiId, primaryYear)
      : null;

    const labelMap      = CATEGORY_LABEL_MAP[activeSection];
    const categoryLabel = labelMap ? (labelMap[category] ?? category) : 'Records';

    const subtitle = zeroTargetCategory
      ? `Academic Year ${primaryYear} — Assign records into: ${labelMap?.[zeroTargetCategory] ?? zeroTargetCategory}`
      : `Academic Year ${primaryYear}`;

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
  }, [drilldown, activeSection, primaryYear, isComparing]);

  // Active tip text
  const activeTip = useMemo(() => {
    if (isComparing) return null;
    const registry = SECTION_DRILLDOWN_REGISTRY[activeSection];
    return registry?.tip ?? SECTION_TIPS[activeSection] ?? null;
  }, [activeSection, isComparing]);

  const sections       = summaryConfig.getSectionList();
  const sectionOptions = [
    {
      group: 'Summary Sections',
      options: sections.map((s) => ({ value: s.id, label: s.title })),
    },
  ];

  const gridConfig = summaryConfig.gridDefaults;

  const hasYears = selectedYears.length > 0;
  const hasData  = sectionData.length > 0;

  return (
    <AdminLayout title="Summary View">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Summary Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all HEI summary submissions by academic year
            </p>
          </div>

          {isComparing && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <IoGitCompare className="w-4 h-4" />
              Comparing {selectedYears.length} years
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <FormSelector
            currentForm={activeSection}
            options={sectionOptions}
            mode="custom"
            onCustomChange={handleSectionChange}
            label="Section"
            icon={IoGridOutline}
            disabled={loading}
          />
          <YearMultiSelect
            availableYears={availableYears}
            selectedYears={selectedYears}
            onChange={handleYearsChange}
            disabled={loading}
          />
        </div>

        {/* Comparison banner */}
        {isComparing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3">
            <div className="flex items-start gap-3">
              <IoGitCompare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Multi-year comparison mode
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Showing data for: <strong>{selectedYears.join(' → ')}</strong>.
                  {' '}Δ columns show the change between each consecutive pair of years.
                  {' '}Drilldown is disabled in comparison mode — switch to a single year to view individual records.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Display */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">
                {isComparing
                  ? `Loading data for ${selectedYears.length} years…`
                  : 'Loading data…'}
              </span>
            </div>
          </div>
        ) : !hasYears ? (
          <EmptyState
            icon={<IoInformationCircle className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Academic Year Selected"
            message="Please select at least one academic year to view summary data"
          />
        ) : !hasData ? (
          <EmptyState
            icon={<IoDocumentText className="mx-auto h-12 w-12 text-gray-400" />}
            title="No Data Available"
            message={
              isComparing
                ? `No HEI data found for the selected years (${selectedYears.join(', ')})`
                : `No HEIs found for academic year ${primaryYear}`
            }
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {activeTip && !isComparing && (
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
              key={`${activeSection}::${isComparing ? 'compare' : 'single'}`}
              rowData={sectionData}
              columnDefs={columnDefs}
              height={gridConfig.height}
              paginationPageSize={gridConfig.paginationPageSize}
              paginationPageSizeSelector={gridConfig.paginationPageSizeSelector}
              enableQuickFilter={gridConfig.enableQuickFilter}
              quickFilterPlaceholder={
                isComparing
                  ? 'Search by HEI name, code, type…'
                  : gridConfig.quickFilterPlaceholder
              }
            />
          </div>
        )}
      </div>

      {/* Drilldown Modal (single-year mode only) */}
      {modalProps && !isComparing && (
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
