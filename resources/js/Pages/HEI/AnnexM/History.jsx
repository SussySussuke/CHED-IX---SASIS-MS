import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import HEILayout from '../../../Layouts/HEILayout';
import CancelSubmissionModal from '../../../Components/Modals/CancelSubmissionModal';
import { useCancelSubmission } from '../../../Hooks/useCancelSubmission';
import HistoryHeader from '../../../Components/Annex/HistoryHeader';
import BatchCard from '../../../Components/Annex/BatchCard';
import EmptyState from '../../../Components/Annex/EmptyState';

const SECTIONS = [
  'A. Persons with Disabilities',
  'B. Indigenous People',
  'C. Dependents of Solo Parents / Solo Parents',
  'D. Other students with special needs',
];

const History = ({ batches }) => {
  const { showCancelModal, selectedId, handleCancel, handleCancelConfirm, handleCancelClose } = useCancelSubmission('annex-m');
  const [expandedBatches, setExpandedBatches] = useState({});
  const [batchData, setBatchData] = useState({});

  const toggleBatch = async (batchId) => {
    if (expandedBatches[batchId]) {
      setExpandedBatches(prev => ({ ...prev, [batchId]: false }));
    } else {
      setExpandedBatches(prev => ({ ...prev, [batchId]: true }));
      if (!batchData[batchId]) {
        try {
          const response = await fetch(`/hei/annex-m/${batchId}/data`);
          const data = await response.json();
          setBatchData(prev => ({ ...prev, [batchId]: data }));
        } catch (error) {
          console.error('Failed to fetch batch data:', error);
        }
      }
    }
  };

  const getTotalEnrollment = (row) => {
    return (parseInt(row.ay_2023_2024_enrollment) || 0) +
           (parseInt(row.ay_2022_2023_enrollment) || 0) +
           (parseInt(row.ay_2021_2022_enrollment) || 0);
  };

  const getTotalGraduates = (row) => {
    return (parseInt(row.ay_2023_2024_graduates) || 0) +
           (parseInt(row.ay_2022_2023_graduates) || 0) +
           (parseInt(row.ay_2021_2022_graduates) || 0);
  };

  const renderStatisticsTable = (statistics) => {
    if (!statistics || statistics.length === 0) return null;

    let currentCategory = null;
    let categoryRowCount = 0;
    const categoryStartIndices = {};

    // Calculate category row counts
    statistics.forEach((row, index) => {
      if (row.category !== currentCategory) {
        if (currentCategory !== null) {
          categoryStartIndices[currentCategory] = { start: index - categoryRowCount, count: categoryRowCount };
        }
        currentCategory = row.category;
        categoryRowCount = 1;
      } else {
        categoryRowCount++;
      }
    });
    if (currentCategory !== null) {
      categoryStartIndices[currentCategory] = { start: statistics.length - categoryRowCount, count: categoryRowCount };
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Category</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Subcategory</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2023-2024<br/>Enrollment</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2023-2024<br/>Graduates</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2022-2023<br/>Enrollment</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2022-2023<br/>Graduates</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2021-2022<br/>Enrollment</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">AY 2021-2022<br/>Graduates</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Total<br/>Enrollment</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total<br/>Graduates</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {statistics.map((row, index) => {
              const isFirstInCategory = index === 0 || statistics[index - 1].category !== row.category;
              const categoryInfo = categoryStartIndices[row.category];
              const rowspan = isFirstInCategory ? categoryInfo.count : 0;
              const isReadOnly = row.is_subtotal || row.category === 'TOTAL';
              const bgClass = isReadOnly ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : 'bg-white dark:bg-gray-800';

              return (
                <tr key={index} className={bgClass}>
                  {isFirstInCategory && (
                    <td rowSpan={rowspan} className="px-2 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 align-top">
                      {row.category}
                    </td>
                  )}
                  <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.subcategory || 'TOTAL'}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2023_2024_enrollment}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2023_2024_graduates}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2022_2023_enrollment}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2022_2023_graduates}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2021_2022_enrollment}
                  </td>
                  <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    {row.ay_2021_2022_graduates}
                  </td>
                  <td className="px-2 py-2 text-sm text-center font-semibold border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {getTotalEnrollment(row)}
                  </td>
                  <td className="px-2 py-2 text-sm text-center font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {getTotalGraduates(row)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderServicesTable = (services) => {
    if (!services || services.length === 0) return null;

    return (
      <div className="space-y-4">
        {SECTIONS.map(section => {
          const sectionServices = services.filter(s => s.section === section);
          if (sectionServices.length === 0) return null;

          return (
            <div key={section}>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{section}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Category</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Institutional Services/Programs/Activities</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">No. of Beneficiaries/Participants</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sectionServices.map((service, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          {service.category || '-'}
                        </td>
                        <td className="px-2 py-2 text-sm border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          {service.institutional_services_programs_activities}
                        </td>
                        <td className="px-2 py-2 text-sm text-center border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          {service.number_of_beneficiaries_participants}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {service.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <HEILayout title="Annex M History">
      <div className="space-y-6">
        <HistoryHeader
          annexName="M"
          submitUrl="/hei/annex-m/submit"
        />
        {batches.length === 0 ? (
          <EmptyState title="No Submissions Yet" message="You haven't submitted any Annex M data yet." buttonText="Create Your First Submission" buttonHref="/hei/annex-m/submit" />
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => {
              const canCancel = batch.status === 'request';
              const isPublished = batch.status === 'published';
              const isExpanded = expandedBatches[batch.batch_id];
              const data = batchData[batch.batch_id];
              return (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  isExpanded={isExpanded}
                  onToggle={() => toggleBatch(batch.batch_id)}
                  editUrl={`/hei/annex-m/${batch.batch_id}/edit`}
                  onCancel={() => handleCancel(batch.batch_id)}
                >
                  {data && (
                    <div className="space-y-4">
                      {data.statistics && data.statistics.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Table 1: Statistics</h3>
                          {renderStatisticsTable(data.statistics)}
                        </div>
                      )}
                      {data.services && data.services.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Table 2: Services</h3>
                          {renderServicesTable(data.services)}
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
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        submissionId={selectedId}
      />
    </HEILayout>
  );
};

export default History;
