import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { IoSend, IoDocument, IoCheckmarkCircle } from 'react-icons/io5';

const QuickActions = ({ checklist, selectedYear }) => {
  // Find the first incomplete form (priority: SUMMARY, then A-O)
  const nextIncompleteForm = useMemo(() => {
    if (!checklist || checklist.length === 0) return null;

    // Priority order: SUMMARY first, then A-O
    const priorityOrder = ['SUMMARY', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    
    for (const annex of priorityOrder) {
      const form = checklist.find(item => item.annex === annex);
      if (form && form.status === 'not_started') {
        return form;
      }
    }

    return null;
  }, [checklist]);

  // Check if all forms are filled (no 'not_started' status)
  const allFormsFilled = useMemo(() => {
    if (!checklist || checklist.length === 0) return false;
    return checklist.every(item => item.status !== 'not_started');
  }, [checklist]);

  const getContinueUrl = () => {
    const yearParam = selectedYear ? `?year=${selectedYear}` : '';
    
    if (!nextIncompleteForm) return `/hei/submissions/history${yearParam}`;
    
    if (nextIncompleteForm.annex === 'SUMMARY') {
      return `/hei/summary/create${yearParam}`;
    }
    
    return `/hei/annex-${nextIncompleteForm.annex.toLowerCase()}/submit${yearParam}`;
  };

  const getContinueText = () => {
    if (!nextIncompleteForm) return 'View All Forms';
    
    if (nextIncompleteForm.annex === 'SUMMARY') {
      return 'Continue Summary';
    }
    
    return `Continue Annex ${nextIncompleteForm.annex}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {allFormsFilled ? (
          <button
            disabled
            className="w-full px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <IoCheckmarkCircle className="w-5 h-5" />
            All Forms Submitted
          </button>
        ) : (
          <Link
            href={getContinueUrl()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <IoSend className="w-4 h-4" />
            {getContinueText()}
          </Link>
        )}
        <Link
          href={`/hei/submissions/history${selectedYear ? `?year=${selectedYear}` : ''}`}
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <IoDocument className="w-4 h-4" />
          View All Forms
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
