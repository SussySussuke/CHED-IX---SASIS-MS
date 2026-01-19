import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useDarkMode } from '../../../Hooks/useDarkMode';
import { useCancelSubmission } from '../../../Hooks/useCancelSubmission';
import HistoryHeader from '../../../Components/Annex/HistoryHeader';
import BatchCard from '../../../Components/Annex/BatchCard';
import EmptyState from '../../../Components/Annex/EmptyState';
import { HOT_TABLE_DARK_MODE_STYLES } from '../../../Utils/hotTableStyles';

registerAllModules();

const History = ({ batches }) => {
  const isDark = useDarkMode();
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-f');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchActivities, setBatchActivities] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchActivities[batchId]) {
        try {
          const response = await fetch(`/hei/annex-f/${batchId}/activities`);
          const data = await response.json();
          setBatchActivities(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        }
      }
    }
  };

  const columns = [
    {
      data: 'activity',
      title: 'Activity',
      type: 'text',
      readOnly: true,
      width: 300
    },
    {
      data: 'date',
      title: 'Date',
      type: 'date',
      dateFormat: 'YYYY-MM-DD',
      readOnly: true,
      width: 150
    },
    {
      data: 'status',
      title: 'Status',
      type: 'text',
      readOnly: true,
      width: 200
    }
  ];

  return (
    <HEILayout title="Annex F History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="F"
          submitUrl="/hei/annex-f/submit"
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex F data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-f/submit"
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isExpanded = expandedBatches[batch.batch_id];
              const data = batchActivities[batch.batch_id];
              const activities = data?.activities || [];
              const procedureMechanism = data?.procedure_mechanism;
              const complaintDesk = data?.complaint_desk;

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-f/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  {(procedureMechanism || complaintDesk) && (
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      {procedureMechanism && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Procedure/mechanism to address student grievance
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {procedureMechanism}
                          </p>
                        </div>
                      )}
                      {complaintDesk && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Complaint desk
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {complaintDesk}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="overflow-auto">
                    <HotTable
                      data={activities}
                      colHeaders={true}
                      rowHeaders={true}
                      columns={columns}
                      height="auto"
                      licenseKey="non-commercial-and-evaluation"
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

      <CancelSubmissionModal
        show={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
      />
    </HEILayout>
  );
};

export default History;
