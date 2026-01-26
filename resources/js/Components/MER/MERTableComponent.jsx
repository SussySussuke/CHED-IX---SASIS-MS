import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { AGGridViewer, IconButton } from '@/Components/Common';
import EvidenceModal from '../Modals/EvidenceModal';
import { IoEye } from 'react-icons/io5';

/**
 * MER Table Component for Forms 1-3
 * Now renders separate tables for each annex
 */
const MERTableComponent = ({ formData, config }) => {
  const [tableDataByAnnex, setTableDataByAnnex] = useState({});
  const [originalDataByAnnex, setOriginalDataByAnnex] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // Transform formData into separate tables by annex
  useEffect(() => {
    if (!formData?.services || !config?.services) {
      setTableDataByAnnex({});
      return;
    }

    const dataByAnnex = {};

    formData.services.forEach(service => {
      if (!service.rows || service.rows.length === 0) return;

      const annexType = service.annex_type;
      const configService = config.services.find(s => s.annexType === annexType);
      
      if (!configService) return;

      if (!dataByAnnex[annexType]) {
        dataByAnnex[annexType] = {
          annexLetter: configService.annexLetter,
          serviceName: configService.name,
          rows: []
        };
      }

      const serviceRowCount = service.rows.length;

      service.rows.forEach((row, index) => {
        // Determine evidence title with priority order
        let evidenceTitle = 'View Details';
        if (row.title) evidenceTitle = row.title;
        else if (row.title_of_program) evidenceTitle = row.title_of_program;
        else if (row.title_of_activity) evidenceTitle = row.title_of_activity;
        else if (row.scholarship_name) evidenceTitle = row.scholarship_name;
        else if (row.service_type) evidenceTitle = row.service_type;
        else if (row.organization_name) evidenceTitle = row.organization_name;
        else if (row.housing_name) evidenceTitle = row.housing_name;
        else if (row.publication_name) evidenceTitle = row.publication_name;
        else if (row.activity) evidenceTitle = row.activity;
        else if (row.committee_name) evidenceTitle = row.committee_name;
        else if (row.institutional_services_programs_activities) evidenceTitle = row.institutional_services_programs_activities;
        else if (row.version_publication_date) evidenceTitle = `Student Handbook - ${row.version_publication_date}`;

        dataByAnnex[annexType].rows.push({
          id: `${service.service_name}-${row.id}`,
          service_name: service.service_name,
          service_rowspan: serviceRowCount,
          is_first_in_group: index === 0,
          face_to_face: row.face_to_face || false,
          online: row.online || false,
          evidence: evidenceTitle,
          hei_remarks: row.hei_remarks || '',
          ched_remarks: row.ched_remark !== null ? row.ched_remark : false,
          is_missing: row.is_missing || false,
          _annex_type: service.annex_type,
          _row_id: row.id,
          _batch_id: row.batch_id,
          _hei_id: formData.hei.id,
          _academic_year: formData.academic_year,
          _ched_remark_id: row.ched_remark_id,
          _row_data: row,
        });
      });
    });

    setTableDataByAnnex(dataByAnnex);
    setOriginalDataByAnnex(JSON.parse(JSON.stringify(dataByAnnex)));
    setHasChanges(false);
  }, [formData, config]);

  // Cell Renderers
  const ServiceNameCellRenderer = (params) => {
    if (!params.data.is_first_in_group) {
      return null;
    }
    return (
      <div className="font-semibold text-center flex items-center justify-center h-full">
        {params.value}
      </div>
    );
  };

  const CheckboxCellRenderer = (params) => {
    const { value, colDef, data } = params;
    const isReadOnly = colDef.field !== 'ched_remarks';
    
    return (
      <div className="flex items-center justify-center h-full">
        <input
          type="checkbox"
          checked={value || false}
          disabled={isReadOnly || data.is_missing}
          data-action={isReadOnly || data.is_missing ? null : 'toggle-ched-remark'}
          data-annex-type={data._annex_type}
          data-row-id={data.id}
          className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    );
  };

  const EvidenceCellRenderer = (params) => {
    const { value, data } = params;

    if (data.is_missing) {
      return (
        <div className="flex items-center text-amber-600 dark:text-amber-400 gap-1 px-2">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">Annex not submitted</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-2">
        <IconButton
          data-action="view-evidence"
          data-annex-type={data._annex_type}
          data-row-id={data.id}
          variant="blue"
          title="View Evidence"
          className="p-1.5"
        >
          <IoEye size={14} />
        </IconButton>
        <span className="text-sm truncate">{value || 'View Details'}</span>
      </div>
    );
  };

  const HEIRemarksCellRenderer = (params) => {
    const { value } = params;
    return (
      <div className="px-2 text-left text-sm">
        {value || <span className="text-gray-400 dark:text-gray-500">-</span>}
      </div>
    );
  };

  // Column Definitions
  const getColumnDefs = (annexType) => [
    {
      headerName: 'Service',
      field: 'service_name',
      width: 240,
      cellRenderer: ServiceNameCellRenderer,
      cellClass: 'ag-cell-service',
      rowSpan: (params) => {
        return params.data.is_first_in_group ? params.data.service_rowspan : 1;
      },
      cellClassRules: {
        'ag-cell-span': (params) => params.data.is_first_in_group,
        'ag-cell-hidden': (params) => !params.data.is_first_in_group,
      },
    },
    {
      headerName: 'Strategic Approaches per Mode of Delivery',
      children: [
        {
          headerName: 'Face-to-Face',
          field: 'face_to_face',
          width: 140,
          cellRenderer: CheckboxCellRenderer,
          cellClass: 'ag-cell-center',
        },
        {
          headerName: 'Online',
          field: 'online',
          width: 140,
          cellRenderer: CheckboxCellRenderer,
          cellClass: 'ag-cell-center',
        },
      ],
    },
    {
      headerName: 'Evidence / Supporting Documents',
      field: 'evidence',
      flex: 1,
      minWidth: 200,
      cellRenderer: EvidenceCellRenderer,
      cellClass: 'ag-cell-evidence',
    },
    {
      headerName: 'HEI Remarks',
      headerTooltip: '⬜ = area for improvement/development',
      field: 'hei_remarks',
      width: 200,
      cellRenderer: HEIRemarksCellRenderer,
      cellClass: 'ag-cell-left',
    },
    {
      headerName: 'CHED Remarks / Observations',
      headerTooltip: '✅ = model/s of practice / best practice / innovative practices',
      field: 'ched_remarks',
      width: 220,
      cellRenderer: CheckboxCellRenderer,
      cellClass: 'ag-cell-center',
    },
  ];

  // Handle cell clicks for checkbox toggling and evidence viewing
  const handleCellClicked = (params, annexType) => {
    const target = params.event.target;
    const element = target.closest('[data-action]');
    
    if (!element) return;
    
    const action = element.getAttribute('data-action');
    const rowId = element.getAttribute('data-row-id');
    
    if (action === 'toggle-ched-remark') {
      // Toggle the checkbox
      const newData = { ...tableDataByAnnex };
      const row = newData[annexType].rows.find(r => r.id === rowId);
      
      if (row && !row.is_missing) {
        row.ched_remarks = !row.ched_remarks;
        setTableDataByAnnex(newData);
        setHasChanges(true);
      }
    } else if (action === 'view-evidence') {
      // Open evidence modal
      const row = tableDataByAnnex[annexType].rows.find(r => r.id === rowId);
      if (row) {
        setSelectedEvidence({
          data: row._row_data,
          annexType: row._annex_type
        });
        setShowEvidenceModal(true);
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const remarksToSave = [];

      // Collect all changed remarks across all annexes
      Object.keys(tableDataByAnnex).forEach(annexType => {
        const currentRows = tableDataByAnnex[annexType].rows;
        const originalRows = originalDataByAnnex[annexType]?.rows || [];

        currentRows.forEach((row, index) => {
          if (row.is_missing) return;
          
          const original = originalRows[index];
          if (original && row.ched_remarks !== original.ched_remarks) {
            remarksToSave.push({
              annex_type: row._annex_type,
              row_id: row._row_id,
              batch_id: row._batch_id,
              hei_id: row._hei_id,
              academic_year: row._academic_year,
              is_best_practice: row.ched_remarks || false,
            });
          }
        });
      });

      if (remarksToSave.length === 0) {
        alert('No changes to save');
        setSaving(false);
        return;
      }

      const response = await axios.post('/admin/mer/remarks/batch', {
        remarks: remarksToSave,
      });

      if (response.data.success) {
        setOriginalDataByAnnex(JSON.parse(JSON.stringify(tableDataByAnnex)));
        setHasChanges(false);
        alert('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving remarks:', error);
      alert('Failed to save remarks. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
              saving || !hasChanges
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Submitting...' : 'Submit CHED Remarks'}
          </button>
        </div>

        {/* Render a table for each annex */}
        {Object.keys(tableDataByAnnex).length > 0 ? (
          Object.entries(tableDataByAnnex).map(([annexType, annexData]) => (
            <div key={annexType} className="space-y-3">
              {/* Annex Header */}
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Annex {annexData.annexLetter}: {annexData.serviceName}
                </h3>
              </div>

              {/* AG Grid Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ minHeight: '60px' }}>
                <AGGridViewer
                  rowData={annexData.rows}
                  columnDefs={getColumnDefs(annexType)}
                  height="auto"
                  enableQuickFilter={false}
                  gridOptions={{
                    domLayout: 'autoHeight',
                    suppressRowTransform: true,
                    rowHeight: 28,
                    headerHeight: 32,
                    groupHeaderHeight: 32,
                    getRowId: (params) => params.data.id,
                    suppressCellFocus: false,
                    enableCellTextSelection: true,
                    onCellClicked: (params) => handleCellClicked(params, annexType),
                    pagination: false,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            No data available
          </div>
        )}
      </div>

      <EvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => {
          setShowEvidenceModal(false);
          setSelectedEvidence(null);
        }}
        rowData={selectedEvidence?.data}
        annexType={selectedEvidence?.annexType}
      />

      {/* Custom CSS for row spanning */}
      <style>{`
        .ag-cell-span {
          display: flex !important;
        }
        .ag-cell-hidden {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default MERTableComponent;
