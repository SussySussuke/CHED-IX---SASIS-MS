import React from 'react';

const SubmissionLock = ({ editUrl, historyUrl, message }) => {
  return (
    <div className="absolute inset-0 bg-gray-900/20 dark:bg-gray-950/85 backdrop-blur-[0.5px] rounded-lg z-50 flex items-center justify-center">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-orange-500 max-w-xs w-full mx-4">
        <div className="text-orange-600 dark:text-orange-400 mb-3">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {editUrl ? 'Published Submission' : 'Form Locked'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message || 'You have already submitted data for this academic year.'}
        </p>
        <div className="flex flex-col gap-2">
          {editUrl && (
            <a
              href={editUrl}
              className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md"
            >
              Edit Submission
            </a>
          )}
          {historyUrl && (
            <a
              href={historyUrl}
              className="inline-block px-5 py-2.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Go to Submission History
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionLock;
