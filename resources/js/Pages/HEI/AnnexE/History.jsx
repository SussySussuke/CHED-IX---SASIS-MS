import React, { useState } from 'react';
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
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-e');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchOrganizations, setBatchOrganizations] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));

      if (!batchOrganizations[batchId]) {
        try {
          const response = await fetch(`/hei/annex-e/${batchId}/organizations`);
          const organizations = await response.json();
          setBatchOrganizations(prev => ({ ...prev, [batchId]: organizations }));
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        }
      }
    }
  };

  const columns = [
    {
      data: 'name_of_accredited',
      title: 'Name',
      type: 'text',
      readOnly: true,
      width: 200
    },
    {
      data: 'years_of_existence',
      title: 'Years',
      type: 'numeric',
      numericFormat: { pattern: '0' },
      readOnly: true,
      width: 80
    },
    {
      data: 'accredited_since',
      title: 'Since',
      type: 'text',
      readOnly: true,
      width: 100
    },
    {
      data: 'faculty_adviser',
      title: 'Adviser',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'president_and_officers',
      title: 'President/Officers',
      type: 'text',
      readOnly: true,
      width: 200
    },
    {
      data: 'specialization',
      title: 'Specialization',
      type: 'text',
      readOnly: true,
      width: 150
    },
    {
      data: 'fee_collected',
      title: 'Fee',
      type: 'text',
      readOnly: true,
      width: 100
    },
    {
      data: 'programs_projects_activities',
      title: 'Activities',
      type: 'text',
      readOnly: true,
      width: 200
    }
  ];

  return (
    <HEILayout title="Annex E History">
      <style>{HOT_TABLE_DARK_MODE_STYLES}</style>

      <div className="space-y-6">
        <HistoryHeader
          annexName="E"
          submitUrl="/hei/annex-e/submit"
        />

        {batches.length === 0 ? (
          <EmptyState
            title="No Submissions Yet"
            message="You haven't submitted any Annex E data yet."
            buttonText="Create Your First Submission"
            buttonHref="/hei/annex-e/submit"
          />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const isExpanded = expandedBatches[batch.batch_id];
              const organizations = batchOrganizations[batch.batch_id] || [];

              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-e/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  <div className="overflow-x-auto">
                    <HotTable
                          data={organizations.map(o => ({
                            name_of_accredited: o.name_of_accredited,
                            years_of_existence: o.years_of_existence,
                            accredited_since: o.accredited_since,
                            faculty_adviser: o.faculty_adviser || '',
                            president_and_officers: o.president_and_officers,
                            specialization: o.specialization,
                            fee_collected: o.fee_collected || '',
                            programs_projects_activities: o.programs_projects_activities
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
