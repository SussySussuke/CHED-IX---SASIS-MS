import React, { useRef, useEffect, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import axios from 'axios';
import EvidenceModal from '../Modals/EvidenceModal';

registerAllModules();

/**
 * Reusable MER Table Component for Forms 1, 2, and 3
 * Renders Handsontable with evidence modal and CHED remarks functionality
 */
const MERTableComponent = ({ formData, config }) => {
  const hotTableRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  // Build table data from formData
  useEffect(() => {
    if (formData && formData.services) {
      const rows = [];

      formData.services.forEach(service => {
        if (service.rows && service.rows.length > 0) {
          service.rows.forEach((row, index) => {
            // Get title for evidence column - priority order matters
            let evidenceTitle = 'View Details';

            // Specific titles for each annex
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

            rows.push({
              service_name: index === 0 ? service.service_name : '',
              service_rowspan: service.rows.length,
              face_to_face: row.face_to_face || false,
              online: row.online || false,
              evidence: evidenceTitle,
              hei_remarks: row.hei_remarks || '',
              ched_remarks: row.ched_remark !== null ? row.ched_remark : null,
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
        }
      });

      setTableData(rows);
      setOriginalData(JSON.parse(JSON.stringify(rows))); // Deep copy for comparison
      setHasChanges(false);
    }
  }, [formData]);

  // Calculate merge cells
  const getMergeCells = () => {
    const merges = [];
    let currentRow = 0;

    if (formData && formData.services) {
      formData.services.forEach(service => {
        if (service.rows && service.rows.length > 0) {
          merges.push({
            row: currentRow,
            col: 0,
            rowspan: service.rows.length,
            colspan: 1
          });
          currentRow += service.rows.length;
        }
      });
    }

    return merges;
  };

  // Handle CHED remark checkbox change (local only, not saved yet)
  const handleCHEDRemarkChange = (row, col, value) => {
    const newData = [...tableData];
    newData[row].ched_remarks = value;
    setTableData(newData);
    setHasChanges(true);
  };

  // Submit all changes to the database
  const handleSubmit = async () => {
    setSaving(true);

    try {
      // Collect all changed remarks
      const remarksToSave = tableData
        .filter((row, index) => {
          if (row.is_missing) return false;
          const original = originalData[index];
          return original && row.ched_remarks !== original.ched_remarks;
        })
        .map(row => ({
          annex_type: row._annex_type,
          row_id: row._row_id,
          batch_id: row._batch_id,
          hei_id: row._hei_id,
          academic_year: row._academic_year,
          is_best_practice: row.ched_remarks || false,
        }));

      if (remarksToSave.length === 0) {
        alert('No changes to save');
        setSaving(false);
        return;
      }

      const response = await axios.post('/admin/mer/remarks/batch', {
        remarks: remarksToSave,
      });

      if (response.data.success) {
        setOriginalData(JSON.parse(JSON.stringify(tableData)));
        alert('Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving remarks:', error);
      alert('Failed to save remarks. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      data: 'service_name',
      title: 'Student Welfare Services',
      readOnly: true,
      className: 'htCenter htMiddle font-semibold',
      width: 200,
    },
    {
      data: 'face_to_face',
      title: 'Face-to-Face',
      type: 'checkbox',
      readOnly: true,
      className: 'htCenter htMiddle',
      width: 100,
      renderer: (instance, td, row, col, prop, value) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.disabled = true;
        checkbox.className = 'opacity-40 cursor-not-allowed';
        td.innerHTML = '';
        td.appendChild(checkbox);
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'online',
      title: 'Online',
      type: 'checkbox',
      readOnly: true,
      className: 'htCenter htMiddle',
      width: 100,
      renderer: (instance, td, row, col, prop, value) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.disabled = true;
        checkbox.className = 'opacity-40 cursor-not-allowed';
        td.innerHTML = '';
        td.appendChild(checkbox);
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'evidence',
      title: 'Evidence / Supporting Documents',
      readOnly: true,
      className: 'htLeft htMiddle',
      width: 250,
      renderer: (instance, td, row, col, prop, value) => {
        const rowData = tableData[row];
        if (rowData?.is_missing) {
          td.innerHTML = `
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs">Annex not submitted</span>
            </div>
          `;
        } else {
          td.innerHTML = `
            <button class="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-left evidence-btn">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>${value || 'View Details'}</span>
            </button>
          `;
          td.style.cursor = 'pointer';

          // Add click handler
          const button = td.querySelector('.evidence-btn');
          if (button) {
            button.addEventListener('click', () => {
              setSelectedEvidence({
                data: rowData._row_data,
                annexType: rowData._annex_type
              });
              setShowEvidenceModal(true);
            });
          }
        }
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'hei_remarks',
      title: 'HEI Remarks',
      readOnly: true,
      className: 'htLeft htMiddle',
      width: 150,
      renderer: (instance, td, row, col, prop, value) => {
        td.innerHTML = value || '<span class="text-gray-400">-</span>';
        td.className = 'htLeft htMiddle';
        return td;
      }
    },
    {
      data: 'ched_remarks',
      title: 'CHED Remarks / Observations',
      type: 'checkbox',
      className: 'htCenter htMiddle',
      width: 150,
      // Remove custom renderer to let Handsontable handle checkbox editing
    }
  ];

  const nestedHeaders = [
    [
      { label: 'Student Welfare Services', rowspan: 2 },
      { label: 'Strategic Approaches per Mode of Delivery', colspan: 2 },
      { label: 'Evidence / Supporting Documents', rowspan: 2 },
      { label: 'HEI', colspan: 1 },
      { label: 'CHED Remarks /', colspan: 1 }
    ],
    [
      '',
      'Face-to-Face',
      'Online',
      '',
      '☑ = Best Practice',
      '☐ = Area for Improvement'
    ]
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Submit button at top */}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 relative">
          <style>{`
            .handsontable td,
            .handsontable th {
              vertical-align: middle !important;
              white-space: normal !important;
            }

            .handsontable .htMiddle {
              vertical-align: middle !important;
            }

            .handsontable .htDropdownMenu {
              z-index: 9999 !important;
            }

            .handsontable .handsontableInputHolder {
              z-index: 9999 !important;
            }

            .handsontable .autocompleteEditor {
              z-index: 9999 !important;
            }

            .handsontable .htAutocompleteArrow {
              z-index: 9999 !important;
            }

            .handsontable .htContextMenu {
              z-index: 9999 !important;
            }

            .handsontable select,
            .handsontable .htSelectEditor {
              z-index: 9999 !important;
            }

            ${isDark ? `
              .handsontable {
                color: #e5e7eb !important;
              }
              .handsontable th {
                background-color: #374151 !important;
                color: #f3f4f6 !important;
                border-color: #4b5563 !important;
                font-weight: 600 !important;
              }
              .handsontable td {
                background-color: #1f2937 !important;
                border-color: #374151 !important;
                color: #e5e7eb !important;
              }
              .handsontable td.area {
                background-color: #111827 !important;
              }
            ` : `
              .handsontable th {
                background-color: #f3f4f6 !important;
                font-weight: 600 !important;
              }
            `}
          `}</style>

          {tableData.length > 0 ? (
            <HotTable
              ref={hotTableRef}
              data={tableData}
              columns={columns}
              nestedHeaders={nestedHeaders}
              colHeaders={true}
              rowHeaders={false}
              width="100%"
              height={600}
              rowHeights={50}
              licenseKey="non-commercial-and-evaluation"
              stretchH="all"
              mergeCells={getMergeCells()}
              afterChange={(changes, source) => {
                if (source === 'edit' && changes) {
                  changes.forEach(([row, prop, oldValue, newValue]) => {
                    if (prop === 'ched_remarks' && oldValue !== newValue) {
                      handleCHEDRemarkChange(row, 5, newValue);
                    }
                  });
                }
              }}
              cells={(row, col) => {
                const cellProperties = {};
                const rowData = tableData[row];

                if (col === 0) {
                  cellProperties.className = 'htCenter htMiddle font-semibold bg-gray-50 dark:bg-gray-700';
                }

                if (rowData?.is_missing) {
                  cellProperties.readOnly = true;
                  cellProperties.className = (cellProperties.className || '') + ' opacity-50';
                }

                return cellProperties;
              }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => {
          setShowEvidenceModal(false);
          setSelectedEvidence(null);
        }}
        rowData={selectedEvidence?.data}
        annexType={selectedEvidence?.annexType}
      />
    </>
  );
};

export default MERTableComponent;
