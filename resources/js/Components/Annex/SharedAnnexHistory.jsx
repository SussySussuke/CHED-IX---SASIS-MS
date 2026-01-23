import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import HEILayout from '../../Layouts/HEILayout';
import CancelSubmissionModal from '../Modals/CancelSubmissionModal';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useDarkMode } from '../../Hooks/useDarkMode';
import { useCancelSubmission } from '../../Hooks/useCancelSubmission';
import HistoryHeader from './HistoryHeader';
import BatchCard from './BatchCard';
import EmptyState from './EmptyState';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../Utils/hotTableStyles';
import { getAnnexConfig } from '../../Config/annexConfig';

registerAllModules();

/**
 * Shared component for Annex A, B, C, E, F History pages
 * @param {string} annexLetter - The annex letter (A, B, C, E, F)
 * @param {array} batches - Array of batch submissions
 */
const SharedAnnexHistory = ({ annexLetter, batches }) => {
  const config = getAnnexConfig(annexLetter);
  const isDark = useDarkMode();
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission(`annex-${annexLetter.toLowerCase()}`);
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchData, setBatchData] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      // Collapse
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      // Expand and fetch data if not already fetched
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchData[batchId]) {
        // Fetch data for this batch
        try {
          const response = await fetch(`${config.endpoint}/${batchId}/${config.entityName}`);
          const data = await response.json();
          setBatchData(prev => ({
            ...prev,
            [batchId]: config.hasFormFields ? data : data  // For Annex F, data includes both activities and form fields
          }));
        } catch (error) {
          console.error(`Failed to fetch ${config.entityName}:`, error);
        }
      }
    }
  };

  // Create read-only columns (remove actions column, set all to readOnly)
  const columns = config.columns.map(col => ({
    ...col,
    readOnly: true,
    width: col.width * 0.8  // Slightly smaller widths for history view
  }));

  return (
    <HEILayout title={`Annex ${annexLetter} History`}>
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName={annexLetter}
          submitUrl={`${config.endpoint}/submit`}
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message={`You haven't submitted any Annex ${annexLetter} data yet.`}
            buttonText="Create Your First Submission"
            buttonHref={`${config.endpoint}/submit`}
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isExpanded = expandedBatches[batch.batch_id];
              const data = batchData[batch.batch_id];

              // Handle different data structures (Annex F has additional fields)
              const entities = config.hasFormFields
                ? (data?.[config.entityName] || data?.activities || [])
                : (data || []);

              const formFieldsData = config.hasFormFields ? data : null;

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`${config.endpoint}/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  {/* Form fields (for Annex F) */}
                  {config.hasFormFields && formFieldsData && (formFieldsData.procedure_mechanism || formFieldsData.complaint_desk) && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      {formFieldsData.procedure_mechanism && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Procedure/mechanism to address student grievance
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formFieldsData.procedure_mechanism}
                          </p>
                        </div>
                      )}
                      {formFieldsData.complaint_desk && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Complaint desk
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formFieldsData.complaint_desk}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Data table */}
                  <div className="overflow-x-auto">
                    <HotTable
                      data={entities.map(config.dataMapper)}
                      colHeaders={true}
                      rowHeaders={true}
                      columns={columns}
                      height="auto"
                      licenseKey="non-commercial-and-evaluation"
                      readOnly={true}
                      stretchH="all"
                      className={isDark ? 'dark-table' : ''}
                    />
                  </div>
                </BatchCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Submission Modal */}
      <CancelSubmissionModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        submissionId={selectedId}
      />
    </HEILayout>
  );
};

export default SharedAnnexHistory;
