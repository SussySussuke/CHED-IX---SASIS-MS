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

// ─── AG Grid column defs for the drilldown modal (shared for all categories) ──
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

// ─── Category options for the recategorize dropdown ───────────────────────────
const RECATEGORIZE_OPTIONS = INFO_ORIENTATION_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: INFO_ORIENTATION_CATEGORY_LABELS[key],
}));

// ─── Blank drilldown state ────────────────────────────────────────────────────
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
    } else {
      setSectionData(summaries);
    }
  };

  useEffect(() => {
    if (activeSection !== '2-Info-Orientation') setSectionData(summaries);
  }, [summaries, activeSection]);

  useEffect(() => {
    if (activeSection === '2-Info-Orientation' && selectedYear) {
      handleSectionChange('2-Info-Orientation');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ── Activity cell click → open drilldown modal ────────────────────────────
  // When count is 0, open the total view so the admin can see all records
  // and assign some into the target category from there.
  const handleActivityClick = (category, heiId, heiName, count) => {
    if (count === null || count === undefined) return;
    if (count === 0 && category !== 'total') {
      setDrilldown({ isOpen: true, heiId, heiName, category: 'total', zeroTargetCategory: category });
    } else {
      setDrilldown({ isOpen: true, heiId, heiName, category, zeroTargetCategory: null });
    }
  };

  const closeDrilldown = () => setDrilldown(CLOSED_MODAL);

  const handleRecategorized = () => {
    handleSectionChange('2-Info-Orientation');
  };

  // ── Column defs ────────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    if (activeSection === '2-Info-Orientation') {
      return summaryConfig.getSection(activeSection).getColumns(handleActivityClick);
    }
    return summaryConfig.getSectionColumns(activeSection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // ── Derive modal props from drilldown state ────────────────────────────────
  const drilldownProps = useMemo(() => {
    const { heiId, heiName, category, zeroTargetCategory } = drilldown;
    const isTotal = category === 'total';
    const isMisc  = category === 'uncategorized';

    const fetchUrl = heiId && category && selectedYear
      ? `/admin/summary/info-orientation/${heiId}/${category}/evidence?year=${selectedYear}`
      : null;

    // "View All Records" button inside the modal — total endpoint for this HEI.
    // Null when already viewing total so the button doesn't appear.
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
  }, [drilldown, selectedYear]);

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

      {/* ── Category Drilldown / Recategorization Modal ── */}
      <RecordsModal
        {...drilldownProps}
        isOpen={drilldown.isOpen}
        onClose={closeDrilldown}
        onRecategorized={handleRecategorized}
      />
    </AdminLayout>
  );
};

export default SummaryView;
