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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-h');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchData, setBatchData] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchData[batchId]) {
        try {
          const response = await fetch(`/hei/annex-h/${batchId}/data`);
          const data = await response.json();
          setBatchData(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch batch data:', error);
        }
      }
    }
  };

  const servicesColumns = [
    { data: 'service_type', title: 'Service Type', type: 'text', readOnly: true, width: 350 },
    { data: 'with', title: 'With', type: 'checkbox', readOnly: true, width: 80, className: 'htCenter' },
    { data: 'supporting_documents', title: 'Supporting Documents', type: 'text', readOnly: true, width: 250 },
    { data: 'remarks', title: 'Remarks', type: 'text', readOnly: true, width: 250 }
  ];

  const statisticsColumns = [
    { data: 'program', title: 'Program', type: 'text', readOnly: true, width: 300 },
    { data: 'applicants', title: 'Applicants', type: 'numeric', readOnly: true, width: 120 },
    { data: 'admitted', title: 'Admitted', type: 'numeric', readOnly: true, width: 120 },
    { data: 'enrolled', title: 'Enrolled', type: 'numeric', readOnly: true, width: 120 }
  ];

  return (
    <HEILayout title="Annex H History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="H"
          submitUrl="/hei/annex-h/submit"
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex H data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-h/submit"
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isExpanded = expandedBatches[batch.batch_id];
              const data = batchData[batch.batch_id];

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-h/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  {data && (
                    <div className="space-y-4">
                      {data.admission_services && data.admission_services.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admission Services</h3>
                          <div className="overflow-auto">
                            <HotTable
                              data={data.admission_services}
                              colHeaders={true}
                              rowHeaders={true}
                              columns={servicesColumns}
                              height="auto"
                              licenseKey="non-commercial-and-evaluation"
                              stretchH="all"
                              className={isDark ? 'dark-table' : ''}
                            />
                          </div>
                        </div>
                      )}

                      {data.admission_statistics && data.admission_statistics.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Admission Statistics</h3>
                          <div className="overflow-auto">
                            <HotTable
                              data={data.admission_statistics}
                              colHeaders={true}
                              rowHeaders={true}
                              columns={statisticsColumns}
                              height="auto"
                              licenseKey="non-commercial-and-evaluation"
                              stretchH="all"
                              className={isDark ? 'dark-table' : ''}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
