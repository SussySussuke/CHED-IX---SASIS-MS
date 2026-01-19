import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-a');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchPrograms, setBatchPrograms] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      // Collapse
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      // Expand and fetch programs if not already fetched
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchPrograms[batchId]) {
        // Fetch programs for this batch
        try {
          const response = await fetch(`/hei/annex-a/${batchId}/programs`);
          const programs = await response.json();
          setBatchPrograms(prev => ({ ...prev, [batchId]: programs }));
        } catch (error) {
          console.error('Failed to fetch programs:', error);
        }
      }
    }
  };

  const columns = [
    {
      data: 'title',
      title: 'Title',
      type: 'text',
      readOnly: true,
      width: 250
    },
    {
      data: 'venue',
      title: 'Venue',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'implementation_date',
      title: 'Date',
      type: 'date',
      dateFormat: 'YYYY-MM-DD',
      readOnly: true,
      width: 120
    },
    {
      data: 'target_group',
      title: 'Target Group',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'participants_online',
      title: 'Online',
      type: 'numeric',
      numericFormat: { pattern: '0,0' },
      readOnly: true,
      width: 100
    },
    {
      data: 'participants_face_to_face',
      title: 'Face-to-Face',
      type: 'numeric',
      numericFormat: { pattern: '0,0' },
      readOnly: true,
      width: 110
    },
    {
      data: 'organizer',
      title: 'Organizer',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'remarks',
      title: 'Remarks',
      type: 'text',
      readOnly: true,
      width: 200
    }
  ];

  return (
    <HEILayout title="Annex A History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="A"
          submitUrl="/hei/annex-a/submit"
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex A data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-a/submit"
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isExpanded = expandedBatches[batch.batch_id];
              const programs = batchPrograms[batch.batch_id] || [];

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-a/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-x-auto">
                    <HotTable
                      data={programs.map(p => ({
                        title: p.title,
                        venue: p.venue,
                        implementation_date: p.implementation_date ? p.implementation_date.split('T')[0] : '',
                        target_group: p.target_group,
                        participants_online: p.participants_online,
                        participants_face_to_face: p.participants_face_to_face,
                        organizer: p.organizer,
                        remarks: p.remarks || ''
                      }))}
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

export default History;
